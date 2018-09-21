import CQWebSocketFactory, { CQWebSocket, CQWebSocketOption, CQEvent } from "cq-websocket";
import { cItemdb } from "../itemdb";
import { cCEVEMarketApi } from "../CEveMarketApi";
import { startsWith, trim, replace, map, join } from "lodash";

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
            let d = await this.handlerMessage(event, context)
            if (d) {
                return `[CQ:at,qq=${context.user_id}]\n${d}`;
            }
        })
    }
    startup() {
        this.bot.connect()
    }
    async handlerMessage(event: CQEvent, context: Record<string, any>): Promise<string | null> {
        if (startsWith(context.message, '.jita')) {
            let message: string = context.message;
            message = trim(replace(message, '.jita', ''));
            if (message.length > 0) {
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
        return null
    }
}

