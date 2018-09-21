import CQWebSocketFactory, { CQEvent } from 'cq-websocket'
import { WebsocketType, CQWebSocketOption, CQWebSocket } from 'cq-websocket'
import { startsWith, replace, trimStart, trim, filter, join, map } from 'lodash'
import { forEach } from 'lodash';
import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './CEveMarketApi';

class cQQBot {
  readonly bot: CQWebSocket
  constructor(config: Partial<CQWebSocketOption>, readonly itemdb: cItemdb, readonly CEVEMarketApi: cCEVEMarketApi) {
    this.bot = new CQWebSocketFactory(config);
    this.bot.on('socket.connecting', function (wsType, attempts) {
      console.log(`attemp to connect ${wsType} No.${attempts} started`)
    }).on('socket.connect', function (wsType, sock, attempts) {
      console.log(`attemp to connect ${wsType} No.${attempts} success`)
    }).on('socket.failed', function (wsType, attempts) {
      console.log(`attemp to connect ${wsType} No.${attempts} failed`)
    })

    this.bot.on('message', async (event, context) :Promise<string|void>=> {
      let d = await this.handlerMessage(event, context)
      if(d){
        return d;
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
          let marketdata = await Promise.all(items.map(async item=>{
            let market = this.CEVEMarketApi.getMarketString(await this.CEVEMarketApi.marketRegion(item.typeID))
            return `${item.name} --- ${market}`;
          }))
          return join(marketdata,"\n");
        } else if (items.length > 5) {
          return `共有${items.length}种物品符合该条件，请给出更明确的物品名称`
        } else {
          return '找不到该物品'
        }
      }
    }
    return null
  }
}





let cqwebConfig = {
  access_token: "",
  host: "172.81.230.235",
  port: 6700
}

console.log(cqwebConfig)
let itemdb = new cItemdb('itemdb.xls');
let CEVEMarketApi = new cCEVEMarketApi();
let bot = new cQQBot(cqwebConfig, itemdb, CEVEMarketApi);
bot.startup();