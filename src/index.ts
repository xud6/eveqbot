import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './ceve_market_api/index';
import { cQQBot } from './bot/index';
import { CQWebSocketOption } from '@xud6/cq-websocket';
import { tLogger } from "tag-tree-logger";
import { typeormdb } from './db';
import { tConfig } from './types';
import { cModels } from './models/indes';

export interface eveqbotExtService {

}
export class eveqbot {
    readonly logger: tLogger
    db: typeormdb
    itemdb: cItemdb
    CEVEMarketApi: cCEVEMarketApi
    bot: cQQBot
    models: cModels
    constructor(readonly parentLogger: tLogger, readonly extService: eveqbotExtService, readonly config: tConfig) {
        this.logger = parentLogger.logger(["eveqbot"])
        this.db = new typeormdb(this.logger, this.config.db)
        this.models = new cModels(this.logger, { db: this.db }, {})
        this.itemdb = new cItemdb('itemdb.xls');
        this.CEVEMarketApi = new cCEVEMarketApi();
        this.bot = new cQQBot(this.logger, { itemdb: this.itemdb, CEVEMarketApi: this.CEVEMarketApi, modelQQBotMessageLog: this.models.modelQQBotMessageLog }, this.config.QQBot);
    }
    async startup() {
        await this.db.startup()
        await this.bot.startup()
    }
    async shutdown() {

    }
}
