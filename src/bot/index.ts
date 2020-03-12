import { CQWebSocket, CQWebSocketOption, CQEvent, WebSocketType, CQTag } from "@xud6/cq-websocket";
import { cItemdb, tItemData } from "../itemdb/index";
import { cCEVEMarketApi } from "../ceve_market_api/index";
import { startsWith, trim, replace, map, join, forEach, take, toString, toInteger, find } from "lodash";
import { tLogger } from "tag-tree-logger";
import { modelQQBotMessageLog } from "../models/modelQQBotMessageLog";

enum opType {
    JITA = '.jita',
    ADDR = '.addr',
    HELP = '.help'
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

function formatItemNames(items: tItemData[], div: number = 5) {
    let d = 0;
    return join(map(items, item => {
        d++;
        if (d > div) {
            d = 0
            return item.name + '\n'
        } else {
            return item.name
        }
    }), " | ")
}

export interface tMessageInfo {
    message: string
    message_id: number
    message_type: string
    group_id?: number
    sender_user_id: number
    sender_nickname: string
    self_id: number
    atMe: boolean
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
        group_id: context.group_id ? toInteger(context.group_id) : undefined,
        sender_user_id: toInteger(context.sender.user_id),
        sender_nickname: toString(context.sender.nickname),
        self_id: toInteger(context.self_id),
        atMe: genMessageInfoAtMe(event, context, tags)
    }
}

export interface tCQQBotCfg {
    cqwebConfig: Partial<CQWebSocketOption>
}

export class cQQBotExtService {
    readonly itemdb: cItemdb
    readonly CEVEMarketApi: cCEVEMarketApi
    readonly modelQQBotMessageLog: modelQQBotMessageLog
}

export class cQQBot {
    readonly logger: tLogger
    readonly bot: CQWebSocket
    readonly jita = {
        searchContentLimit: 30,
        resultPriceListLimit: 5,
        resultNameListLimit: 50
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
            let pHandlerMessage = this.handlerMessage(event, context)
            let pMessageLog = this.extService.modelQQBotMessageLog.appendQQBotMessageLog(messageInfo, event, context, tags);
            let result = await pHandlerMessage;
            await pMessageLog;
            return result
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
        let addr = checkStartWith(context.message, ['.addr', '。adr', '.地址', '。地址']);
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
        return null
    }
    async handlerMessage(event: CQEvent, context: Record<string, any>): Promise<string | void> {
        let command = await this.checkMessage(event, context);
        if (command) {
            let res: string | null = null
            this.logger.info(`Command [${command.op}] with [${command.msg}] from [${context.user_id}]`);
            switch (command.op) {
                case opType.JITA:
                    res = await this.handlerMessageJita(command.msg, context);
                    break;
                case opType.ADDR:
                    res = await this.handlerMessageAddr(command.msg, context);
                    break;
                case opType.HELP:
                    res = await this.handlerMessageHelp(command.msg, context);
                    break;
            }
            if (res) {
                return `[CQ:at,qq=${context.user_id}]\n${res}`
            }
        }
    }
    async handlerMessageJita(message: string, context: Record<string, any>): Promise<string | null> {
        if (message.length > this.jita.searchContentLimit) {
            this.logger.info(`search content too long from [${context.user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.jita.searchContentLimit}`
        }

        let items = this.extService.itemdb.search(message)
        if (items.length == 0) {
            this.logger.info(`找不到 ${message}`)
            return '找不到该物品'
        } else if (items.length > 0 && items.length <= this.jita.resultPriceListLimit) {
            this.logger.info("搜索结果为：" + join(map(items, item => {
                return item.name
            }), "/"))
            let marketdata: string[] = await Promise.all(items.map(async item => {
                let market = await this.extService.CEVEMarketApi.getMarketString(item.itemId.toString())
                return `${item.name} --- ${market}`;
            }))
            return join(marketdata, "\n");
        } else {
            let front = take(items, this.jita.resultNameListLimit);
            this.logger.info(`搜索结果过多: ${items.length}`)
            this.logger.info("搜索结果为：" + join(map(items, item => {
                return item.name
            }), "/"))
            let res = `共有${items.length}种物品符合该条件，请给出更明确的物品名称\n` + formatItemNames(front);
            if (items.length > this.jita.resultNameListLimit) {
                res = res + '\n......'
            }
            return res
        }
    }
    async handlerMessageAddr(message: string, context: Record<string, any>): Promise<string | null> {
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
    async handlerMessageHelp(message: string, context: Record<string, any>): Promise<string | null> {
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

