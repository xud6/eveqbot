import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './ceve_market_api/index';
import { cQQBot } from './bot/index';
import { CQWebSocketOption } from '@xud6/cq-websocket';
import { tLogger } from "tag-tree-logger";

export interface tEveqbotConfig {
    cqwebConfig: Partial<CQWebSocketOption>
}

export interface eveqbotExtService {

}
export class eveqbot {
    itemdb: cItemdb
    CEVEMarketApi: cCEVEMarketApi
    bot: cQQBot
    constructor(readonly parentLogger: tLogger, readonly extService: eveqbotExtService, readonly config: tEveqbotConfig) {
        this.itemdb = new cItemdb('itemdb.xls');
        this.CEVEMarketApi = new cCEVEMarketApi();
        this.bot = new cQQBot(this.config.cqwebConfig, this.itemdb, this.CEVEMarketApi);
    }
    async startup(){
        await this.bot.startup()
    }
    async shutdown(){

    }
}
