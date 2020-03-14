import { CQWebSocket, CQWebSocketOption, CQEvent, WebSocketType, CQTag } from "@xud6/cq-websocket";
import { cCEVEMarketApi } from "../api/ceve_market_api/index";
import { startsWith, trim, replace, map, join, forEach, take, toString, toInteger, find } from "lodash";
import { tLogger } from "tag-tree-logger";
import { modelQQBotMessageLog } from "../models/modelQQBotMessageLog";
import { modelQQBotMessageSource } from "../models/modelQQBotMessageSource";
import { modelEveESIUniverseTypes } from "../models/modelEveESIUniverseTypes";
import { eveESIUniverseTypes } from "../db/entity/eveESIUniverseTypes";
import { QQBotMessageSource } from "../db/entity/QQBotMessageSource";
import { eveMarketApi, eveServerInfo, eveMarketApiInfo } from "../types";

enum opType {
    JITA = '.jita',
    ADDR = '.addr',
    HELP = '.help',
    ITEM = '.item'
}

interface tCommand {
    op: opType,
    msg: string
}

function checkStartWith(msg: string, tags: string[]): string | null {
    for (let tag of tags) {
        if (startsWith(msg, tag)) {
            return trim(replace(msg, tag, ''));
        }
    }
    return null
}

function itemNameDisp(item: eveESIUniverseTypes) {
    return `ID:${item.id} | ${item.cn_name} / ${item.en_name} |${item.group.cn_name}|${item.group.category.cn_name}|`
}

function formatItemNames(items: eveESIUniverseTypes[]) {
    let d = 0;
    return join(map(items, item => {
        return itemNameDisp(item)
    }), "\n")
}

export interface tMessageInfo {
    message: string
    message_id: number
    message_type: string
    group_id: number | null
    discuss_id: number | null
    atMe: boolean
    sender_user_id: number
    sender_nickname: string
    sender_card: string | null
    sender_area: string | null
    sender_level: string | null
    sender_role: string | null
    sender_title: string | null
    self_id: number
    time: number
    sub_type: string | null
    anonymous: any

}

function genMessageInfoAtMe(event: CQEvent, context: Record<string, any>, tags: CQTag[]): boolean {
    let self_id = toInteger(context.self_id);
    let at = find(tags, function (tag) {
        if (tag.tagName === "at") {
            if (tag.data.qq === self_id) {
                return true
            }
        }
        return false
    })
    if (at) {
        return true
    } else {
        return false
    }
}

function genMessageInfo(event: CQEvent, context: Record<string, any>, tags: CQTag[]): tMessageInfo {
    return {
        message: toString(context.message),
        message_id: toInteger(context.message_id),
        message_type: toString(context.message_type),
        group_id: context.group_id ? toInteger(context.group_id) : null,
        discuss_id: context.discuss_id ? toInteger(context.discuss_id) : null,
        atMe: genMessageInfoAtMe(event, context, tags),
        sender_user_id: toInteger(context.sender.user_id),
        sender_nickname: toString(context.sender.nickname),
        sender_card: context.sender.card ? toString(context.sender.card) : null,
        sender_area: context.sender.area ? toString(context.sender.area) : null,
        sender_level: context.sender.level ? toString(context.sender.level) : null,
        sender_role: context.sender.role ? toString(context.sender.role) : null,
        sender_title: context.sender.title ? toString(context.sender.title) : null,
        self_id: toInteger(context.self_id),
        time: toInteger(context.time),
        sub_type: context.sub_type ? toString(context.sub_type) : null,
        anonymous: context.anonymous ? context.anonymous : null
    }
}

export interface tCQQBotCfg {
    cqwebConfig: Partial<CQWebSocketOption>
}

export interface cQQBotExtService {
    CEVEMarketApi: cCEVEMarketApi
    models: {
        modelQQBotMessageLog: modelQQBotMessageLog
        modelQQBotMessageSource: modelQQBotMessageSource,
        modelEveESIUniverseTypes: modelEveESIUniverseTypes
    }
}

export class cQQBot {
    readonly logger: tLogger
    readonly bot: CQWebSocket
    readonly jita = {
        searchContentLimit: 30,
        resultPriceListLimit: 5,
        resultNameListLimit: 50
    }
    readonly item = {
        searchContentLimit: 30,
        resultNameListLimit: 100
    }
    readonly addr = {
        searchContentLimit: 10
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly config: tCQQBotCfg,
    ) {
        this.logger = parentLogger.logger(["QQBot"])
        this.bot = new CQWebSocket(config.cqwebConfig);
        this.bot.on('socket.connecting', (wsType: WebSocketType, attempts: number) => {
            this.logger.info(`attemp to connect ${wsType} No.${attempts} started`)
        }).on('socket.connect', (wsType: WebSocketType, sock: any, attempts: number) => {
            this.logger.info(`attemp to connect ${wsType} No.${attempts} success`)
        }).on('socket.failed', (wsType: WebSocketType, attempts: number) => {
            this.logger.info(`attemp to connect ${wsType} No.${attempts} failed`)
        })

        this.bot.on('message', async (event: CQEvent, context: Record<string, any>, tags: CQTag[]): Promise<string | void> => {
            let messageInfo = genMessageInfo(event, context, tags);
            let messageSource = await this.extService.models.modelQQBotMessageSource.getQQBotMessageSource(messageInfo)
            if (messageSource) {
                let pHandlerMessage = this.handlerMessage(messageSource, event, context)
                let pMessageLog = this.extService.models.modelQQBotMessageLog.appendQQBotMessageLog(messageSource, messageInfo, event, context, tags);
                let result = await pHandlerMessage;
                await pMessageLog;
                return result
            } else {
                this.logger.error(`Can't read or create source for ${messageInfo}`)
            }
        })
    }
    async startup() {
        this.bot.connect()
    }

    async checkMessage(event: CQEvent, context: Record<string, any>): Promise<tCommand | null> {
        let jita = checkStartWith(context.message, ['.jita', '。jita', '.吉他', '。吉他']);
        if (jita) {
            return {
                op: opType.JITA,
                msg: jita
            }
        }
        let addr = checkStartWith(context.message, ['.addr', '。addr', '.地址', '。地址']);
        if (addr) {
            return {
                op: opType.ADDR,
                msg: addr
            }
        }
        let help = checkStartWith(context.message, ['.help', '。help', '.帮助', '。帮助']);
        if (help || help === '') {
            return {
                op: opType.HELP,
                msg: help
            }
        }
        let item = checkStartWith(context.message, ['.item', '。item', '.物品', '。物品']);
        if (item || item === '') {
            return {
                op: opType.ITEM,
                msg: item
            }
        }
        return null
    }
    async handlerMessage(messageSource: QQBotMessageSource, event: CQEvent, context: Record<string, any>): Promise<string | void> {
        let command = await this.checkMessage(event, context);
        if (command) {
            let res: string | null = null
            this.logger.info(`Command [${command.op}] with [${command.msg}] from [${context.user_id}]`);
            switch (command.op) {
                case opType.JITA:
                    res = await this.handlerMessageJita(messageSource, command.msg, context);
                    break;
                case opType.ADDR:
                    res = await this.handlerMessageAddr(messageSource, command.msg, context);
                    break;
                case opType.HELP:
                    res = await this.handlerMessageHelp(messageSource, command.msg, context);
                    break;
                case opType.ITEM:
                    res = await this.handlerMessageItem(messageSource, command.msg, context);
                    break;
            }
            if (res) {
                return `[CQ:at,qq=${context.user_id}]\n${res}`
            }
        }
    }
    async handlerMessageJita(messageSource: QQBotMessageSource, message: string, context: Record<string, any>): Promise<string | null> {
        if (message.length > this.jita.searchContentLimit) {
            this.logger.info(`search content too long from [${context.user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.jita.searchContentLimit}`
        }

        let items = await this.extService.models.modelEveESIUniverseTypes.MarketSearch(message, this.jita.resultNameListLimit + 1)
        if (items.length == 0) {
            this.logger.info(`找不到 ${message}`)
            return '找不到该物品'
        } else if (items.length > 0 && items.length <= this.jita.resultPriceListLimit) {
            if (messageSource.eve_marketApi === eveMarketApi.ceveMarket) {
                let head = `共有${items.length}种物品符合该条件 当前服务器${eveServerInfo[messageSource.eve_server].dispName} 当前市场API${eveMarketApiInfo[messageSource.eve_marketApi].dispName}\n`
                let marketdata: string[] = await Promise.all(items.map(async item => {
                    let market = await this.extService.CEVEMarketApi.getMarketString(item.id.toString(), messageSource.eve_server)
                    return `${itemNameDisp(item)} --- ${market}`;
                }))
                return `${head}${join(marketdata, "\n")}`;
            } else {
                return "市场API配置错误"
            }
        } else {
            this.logger.info(`搜索结果过多: ${items.length}`)
            if (items.length > this.jita.resultNameListLimit) {
                return `共有超过${this.jita.resultNameListLimit}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(items)}\n......`
            } else {
                return `共有${items.length}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(items)}`
            }
        }
    }
    async handlerMessageItem(messageSource: QQBotMessageSource, message: string, context: Record<string, any>): Promise<string | null> {
        if (message.length > this.item.searchContentLimit) {
            this.logger.info(`search content too long from [${context.user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.item.searchContentLimit}`
        }

        let items = await this.extService.models.modelEveESIUniverseTypes.SearchCombined(message, this.item.resultNameListLimit + 1, false)
        if (items.length == 0) {
            this.logger.info(`找不到 ${message}`)
            return '找不到该物品'
        } else {
            if (items.length > this.item.resultNameListLimit) {
                return `共有超过${this.item.resultNameListLimit}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(items)}\n......`
            } else {
                return `共有${items.length}种物品符合该条件\n${formatItemNames(items)}`
            }
        }
    }
    async handlerMessageAddr(messageSource: QQBotMessageSource, message: string, context: Record<string, any>): Promise<string | null> {
        if (message.length > this.addr.searchContentLimit) {
            this.logger.info(`search content too long from [${context.user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.addr.searchContentLimit}`
        }
        if (message.includes('出勤') || message.includes('积分')) {
            return `https://eve.okzai.net/jfcx`
        } else if (message.includes('kb') || message.includes('KB')) {
            return `https://kb.ceve-market.org/`
        } else if (message.includes('导航') || message.includes('旗舰')) {
            return `http://eve.sgfans.org/navigator/jumpLayout`
        } else if (message.includes('合同') || message.includes('货柜')) {
            return `http://tools.ceve-market.org/contract/`
        } else if (message.includes('扫描') || message.includes('5度')) {
            return `http://tools.ceve-market.org/`
        } else if (message.includes('市场')) {
            return `https://www.ceve-market.org/home/`
        } else {
            return `我理解不了`
        }
    }
    async handlerMessageHelp(messageSource: QQBotMessageSource, message: string, context: Record<string, any>): Promise<string | null> {
        if (message.length == 0) {
            return ".jita (.吉他) 查询市场信息\n"
                + ".addr (.地址) 查询常用网址 [出勤积分|KB|旗舰导航|市场|5度|合同分析]\n"
        } else if (message == "version") {
            let pkg: any = require('./../../package.json')
            return `版本号:${pkg.version}`
        } else {
            return null
        }
    }
}

