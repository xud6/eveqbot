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
        let ids = await this.extService.eveESI.universe.types.getIds(page)

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
                    let enData = await this.extService.eveESI.universe.types.getById(id, "en-us");
                    let cnData = await this.extService.eveESI.universe.types.getById(id, "zh");
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
            let ids = await this.processTypesPage(currentPage)
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