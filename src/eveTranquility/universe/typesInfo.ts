import { tLogger } from "tag-tree-logger"
import { isArray } from "lodash"
import fetch from "node-fetch"
import { eveTranquilityExtService } from "../types"

export class eveTypesInfo {
    readonly logger: tLogger
    timerTaskUpdateTypeInfos: NodeJS.Timeout | undefined
    timerTaskUpdateTypeInfosLock: boolean = false
    datasource = "tranquility"
    esiUrl = "https://esi.evetech.net"
    fetchTimeout = 1000 * 20
    apiRetry = 5
    opId = 0;
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: eveTranquilityExtService
    ) {
        this.logger = parentLogger.logger(["typesInfo"])
    }
    async startup() {
        this.TaskUpdateTypeInfos()
        this.timerTaskUpdateTypeInfos = setInterval(() => { this.TaskUpdateTypeInfos() }, 1000 * 60 * 5)
    }
    async shutdown() {
        if (this.timerTaskUpdateTypeInfos) {
            clearInterval(this.timerTaskUpdateTypeInfos)
            this.timerTaskUpdateTypeInfos = undefined
        }
    }
    async retry<T>(func: () => Promise<T>, cnt: number = 1): Promise<T> {
        if (cnt < 1) {
            cnt = 1
        }
        while (cnt-- > 0) {
            try {
                let result = await func()
                return result
            } catch (e) {
                this.logger.warn(e)
            }
        }
        throw new Error(`max retry reached`);
    }
    async TaskUpdateTypeInfos() {
        if (this.timerTaskUpdateTypeInfosLock === false) {
            this.timerTaskUpdateTypeInfosLock = true
            try {
                let runTaskUpdateTypeInfos = await this.extService.models.modelKvs.get("runTaskUpdateTypeInfos");
                if (runTaskUpdateTypeInfos === "SCHEDULE" || runTaskUpdateTypeInfos === "YES" || runTaskUpdateTypeInfos === null) {
                    this.logger.info(`TaskUpdateTypeInfos started`)
                    await this.populateTypesDatabase()
                    this.extService.models.modelKvs.set("runTaskUpdateTypeInfos", "SUCCESS")
                }
            } catch (e) {
                this.logger.error(e)
            }

            this.timerTaskUpdateTypeInfosLock = false
        }
    }
    async processTypesPage(page: number) {
        let opId = this.opId++;
        this.logger.info(`${opId}| process type page ${page}`)
        let ids = await this.retry(() => {
            return this.extService.eveESI.universe.types.getIds(page)
        }, this.apiRetry)

        let processedId = -1;
        try {
            let record = await this.extService.models.modelKvs.get('runTaskUpdateTypeInfosProcessedId')
            if (record) {
                processedId = parseInt(record)
            }
        } catch (e) { }

        for (let id of ids) {
            if (id > processedId) {
                try {
                    this.logger.info(`process data for type ${id}`)
                    let enData = await this.retry(() => {
                        return this.extService.eveESI.universe.types.getById(id, "en-us");
                    }, this.apiRetry)
                    let cnData = await this.retry(() => {
                        return this.extService.eveESI.universe.types.getById(id, "zh");
                    }, this.apiRetry)
                    await this.extService.models.modelEveESIUniverseTypes.set(id, enData, cnData)
                    await this.extService.models.modelKvs.set('runTaskUpdateTypeInfosProcessedId', id.toString())
                } catch (e) {
                    this.logger.warn(e)
                }
            } else {
                this.logger.info(`skip process data for type ${id}, bacause it's less than ${processedId}`)
            }
        }
        this.logger.info(`${opId}| finish process type page ${page}`)
        return ids
    }
    async populateTypesDatabase() {
        let inProcess = true;
        let currentPage = 1;
        try {
            let record = await this.extService.models.modelKvs.get('runTaskUpdateTypeInfosProcessedPage')
            if (record) {
                currentPage = parseInt(record) + 1;
            }
        } catch (e) { }

        while (inProcess) {
            inProcess = false;
            let ids = await this.retry(() => {
                return this.processTypesPage(currentPage)
            }, 3)
            if (ids.length > 0) {
                await this.extService.models.modelKvs.set('runTaskUpdateTypeInfosProcessedPage', currentPage.toString())
                currentPage++;
                inProcess = true;
            } else {
                await this.extService.models.modelKvs.set('runTaskUpdateTypeInfosProcessedId', null)
                await this.extService.models.modelKvs.set('runTaskUpdateTypeInfosProcessedPage', null)
            }
        }
    }
}