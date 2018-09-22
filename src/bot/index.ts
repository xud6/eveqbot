import CQWebSocketFactory, { CQWebSocket, CQWebSocketOption, CQEvent } from "cq-websocket";
import { cItemdb } from "../itemdb";
import { cCEVEMarketApi } from "../CEveMarketApi";
import { startsWith, trim, replace, map, join } from "lodash";

enum opType {
    JITA
}

interface tCommand {
    op: opType,
    msg: string
}

function checkStartWith(msg: string, tags: string[]): string | null {
    for (let tag in tags) {
        if (startsWith(msg, tag)) {
            return trim(replace(msg, tag, ''));
        }
    }
    return null
}

export class cQQBot {
    readonly bot: CQWebSocket
    constructor(
        config: Partial<CQWebSocketOption>,
        readonly itemdb: cItemdb,
        readonly CEVEMarketApi: cCEVEMarketApi
    ) {
        this.bot = new CQWebSocketFactory(config);
        this.bot.on('socket.connecting', function (wsType, attempts) {
            console.log(`attemp to connect ${wsType} No.${attempts} started`)
        }).on('socket.connect', function (wsType, sock, attempts) {
            console.log(`attemp to connect ${wsType} No.${attempts} success`)
        }).on('socket.failed', function (wsType, attempts) {
            console.log(`attemp to connect ${wsType} No.${attempts} failed`)
        })

        this.bot.on('message', async (event, context): Promise<string | void> => {
            console.log(context)
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

        return null
    }
    async handlerMessage(event: CQEvent, context: Record<string, any>): Promise<string | void> {
        let command = await this.checkMessage(event, context);
        if (command) {
            let res: string | null = null
            switch (command.op) {
                case opType.JITA:
                    res = await this.handlerMessageJita(command.msg);
                    break;
            }
            if (res) {
                return `[CQ:at,qq=${context.user_id}]\n${res}`
            }
        }
    }
    async handlerMessageJita(message: string): Promise<string | null> {
        console.log(message);
        let items = this.itemdb.search(message)
        if (items.length > 0 && items.length <= 5) {
            console.log("搜索结果为：" + join(map(items, item => {
                return item.name
            }), "/"))
            let marketdata: string[] = await Promise.all(items.map(async item => {
                let market = this.CEVEMarketApi.getMarketString(await this.CEVEMarketApi.marketRegion(item.typeID))
                return `${item.name} --- ${market}`;
            }))
            return join(marketdata, "\n");
        } else if (items.length > 5) {
            console.log(`搜索结果过多: ${items.length}`)
            return `共有${items.length}种物品符合该条件，请给出更明确的物品名称`
        } else {
            console.log(`找不到 ${message}`)
            return '找不到该物品'
        }
    }
}

