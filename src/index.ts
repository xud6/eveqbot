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
    readonly logger: tLogger
    itemdb: cItemdb
    CEVEMarketApi: cCEVEMarketApi
    bot: cQQBot
    constructor(readonly parentLogger: tLogger, readonly extService: eveqbotExtService, readonly config: tEveqbotConfig) {
        this.logger = parentLogger.logger(["eveqbot"])
        this.itemdb = new cItemdb('itemdb.xls');
        this.CEVEMarketApi = new cCEVEMarketApi();
        this.bot = new cQQBot(this.logger, { itemdb: this.itemdb, CEVEMarketApi: this.CEVEMarketApi }, this.config.cqwebConfig);
    }
    async startup() {
        await this.bot.startup()
    }
    async shutdown() {

    }
}
