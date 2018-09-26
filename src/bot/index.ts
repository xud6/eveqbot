import CQWebSocketFactory, { CQWebSocket, CQWebSocketOption, CQEvent, WebsocketType } from "cq-websocket";
import { cItemdb, tItemData } from "../itemdb/index";
import { cCEVEMarketApi } from "../ceve_market_api/index";
import { startsWith, trim, replace, map, join, forEach, take } from "lodash";

enum opType {
    JITA = '.jita',
    ADDR = '.addr'
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

export class cQQBot {
    readonly bot: any //should be CQWebSocket
    readonly jita = {
        searchContentLimit: 30,
        resultPriceListLimit: 5,
        resultNameListLimit: 50
    }
    readonly addr = {
        searchContentLimit: 10
    }
    constructor(
        config: Partial<CQWebSocketOption>,
        readonly itemdb: cItemdb,
        readonly CEVEMarketApi: cCEVEMarketApi
    ) {
        this.bot = new CQWebSocketFactory(config);
        this.bot.on('socket.connecting', function (wsType: WebsocketType, attempts: number) {
            console.log(`attemp to connect ${wsType} No.${attempts} started`)
        }).on('socket.connect', function (wsType: WebsocketType, sock:any, attempts: number) {
            console.log(`attemp to connect ${wsType} No.${attempts} success`)
        }).on('socket.failed', function (wsType: WebsocketType, attempts: number) {
            console.log(`attemp to connect ${wsType} No.${attempts} failed`)
        })

        this.bot.on('message', async (event: CQEvent, context: Record<string, any>): Promise<string | void> => {
            return await this.handlerMessage(event, context)
        })
    }
    startup() {
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
        return null
    }
    async handlerMessage(event: CQEvent, context: Record<string, any>): Promise<string | void> {
        let command = await this.checkMessage(event, context);
        if (command) {
            let res: string | null = null
            console.log(`Command [${command.op}] with [${command.msg}] from [${context.user_id}]`);
            switch (command.op) {
                case opType.JITA:
                    res = await this.handlerMessageJita(command.msg, context);
                    break;
                case opType.ADDR:
                    res = await this.handlerMessageAddr(command.msg, context);
                    break;
            }
            if (res) {
                return `[CQ:at,qq=${context.user_id}]\n${res}`
            }
        }
    }
    async handlerMessageJita(message: string, context: Record<string, any>): Promise<string | null> {
        if (message.length > this.jita.searchContentLimit) {
            console.log(`search content too long from [${context.user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.jita.searchContentLimit}`
        }

        let items = this.itemdb.search(message)
        if (items.length == 0) {
            console.log(`找不到 ${message}`)
            return '找不到该物品'
        } else if (items.length > 0 && items.length <= this.jita.resultPriceListLimit) {
            console.log("搜索结果为：" + join(map(items, item => {
                return item.name
            }), "/"))
            let marketdata: string[] = await Promise.all(items.map(async item => {
                let market = await this.CEVEMarketApi.getMarketString(item.itemId.toString())
                return `${item.name} --- ${market}`;
            }))
            return join(marketdata, "\n");
        } else {
            let front = take(items, this.jita.resultNameListLimit);
            console.log(`搜索结果过多: ${items.length}`)
            console.log("搜索结果为：" + join(map(items, item => {
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
            console.log(`search content too long from [${context.user_id}]`)
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
}

