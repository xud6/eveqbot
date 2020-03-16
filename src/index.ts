import { cCEVEMarketApi } from './api/ceve_market_api/index';
import { cQQBot } from './bot/index';
import { CQWebSocketOption } from '@xud6/cq-websocket';
import { tLogger } from "tag-tree-logger";
import { typeormdb } from './db';
import { tConfig } from './types';
import { cModels } from './models';
import { eveTranquility } from './eveTranquility';
import { opId } from './opId';
import { eveESI } from './api/eveESI';
import { eveESICfgDefault } from './api/eveESI/types';

export interface eveqbotExtService {

}
export class eveqbot {
    readonly logger: tLogger
    opId: opId
    db: typeormdb
    eveESI: eveESI
    models: cModels
    eveTranquility: eveTranquility
    CEVEMarketApi: cCEVEMarketApi
    bot: cQQBot | null
    constructor(readonly parentLogger: tLogger, readonly extService: eveqbotExtService, readonly config: tConfig) {
        this.logger = parentLogger.logger(["eveqbot"])
        this.opId = new opId()
        this.db = new typeormdb(this.logger, this.config.db)
        this.eveESI = new eveESI(this.logger, { opId: this.opId, httpClientCache: new Map() }, eveESICfgDefault)
        this.models = new cModels(this.logger, { db: this.db, eveESI: this.eveESI, opId: this.opId }, this.config.models)
        this.eveTranquility = new eveTranquility(this.logger, { models: this.models, eveESI: this.eveESI })
        this.CEVEMarketApi = new cCEVEMarketApi(this.logger, { httpClientCache: new Map() }, this.config.CEVEMarketApi);
        if (this.config.service.QQBot) {
            this.bot = new cQQBot(this.logger, { CEVEMarketApi: this.CEVEMarketApi, models: this.models, opId: this.opId }, this.config.QQBot);
        } else {
            this.bot = null
        }
    }
    async startup() {
        await this.db.startup()
        await this.opId.setPersistentKvs(this.models.modelKvs, `${this.config.instanceName}.srvOpIdCurrent`)
        await this.eveTranquility.startup()
        if (this.bot) {
            await this.bot.startup()
        }
        this.refreshData()
    }
    async shutdown() {

    }
    private async refreshDataJob(key: string, task: () => Promise<void>) {
        let k = await this.models.modelKvs.get(key)
        if (k !== "COMPLETE") {
            await task();
            await this.models.modelKvs.set(key, "COMPLETE")
        }
    }
    async refreshData() {
        if (this.config.service.reloadData) {
            await this.refreshDataJob("taskReloadDataUniverseCategorie", async () => {
                this.logger.info("start refresh EveESIUniverseCategories")
                await this.models.modelEveESIUniverseCategories.RefreshData(false, this.config.dataLoadConcurrency)
            })
            await this.refreshDataJob("taskReloadDataUniversGroups", async () => {
                this.logger.info("start refresh EveESIUniverseGroups")
                await this.models.modelEveESIUniverseGroups.RefreshData(false, this.config.dataLoadConcurrency)
            })
            await this.refreshDataJob("taskReloadDataUniversTypes", async () => {
                this.logger.info("start refresh EveESIUniverseTypes")
                await this.models.modelEveESIUniverseTypes.RefreshData(false, this.config.dataLoadConcurrency)
            })
            await this.refreshDataJob("taskReloadDataUniversRegions", async () => {
                this.logger.info("start refresh EveESIUniverseRegions")
                await this.models.modelEveESIUniverseRegions.RefreshData(false, this.config.dataLoadConcurrency)
            })
            await this.refreshDataJob("taskReloadDataUniversConstellations", async () => {
                this.logger.info("start refresh EveESIUniverseConstellations")
                await this.models.modelEveESIUniverseConstellations.RefreshData(false, this.config.dataLoadConcurrency)
            })
            await this.refreshDataJob("taskReloadDataUniversSystems", async () => {
                this.logger.info("start refresh EveESIUniverseSystems")
                await this.models.modelEveESIUniverseSystems.RefreshData(false, this.config.dataLoadConcurrency)
            })
        }
    }
}
