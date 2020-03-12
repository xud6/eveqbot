import { modelKvs } from "../../models/modelKvs"
import { tLogger } from "tag-tree-logger"
import { isArray } from "lodash"
import fetch from "node-fetch"
import { modelEveTQUniverseTypes } from "../../models/modelEveTQUniverseTypes"

export interface eveTQTypesInfoExtService {
    models: {
        modelKvs: modelKvs,
        modelEveTQUniverseTypes: modelEveTQUniverseTypes
    }
}



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
        readonly extService: eveTQTypesInfoExtService
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
    async apiGetTypeId(page: number): Promise<number[]> {
        let opId = this.opId++;
        let url = `${this.esiUrl}/v1/universe/types/?datasource=${this.datasource}&page=${page}`
        this.logger.info(`${opId}| read TypeId page ${page} | ${url}`)
        let result = await fetch(url, { timeout: this.fetchTimeout })
        if (result.ok) {
            let data = await result.json();
            if (isArray(data)) {
                return data
            } else {
                throw new Error(`${opId}| api access error result unexpected ${data}`)
            }
        } else {
            throw new Error(`${opId}| api access error: ${result.statusText}`)
        }
    }
    async apiGetTypeData(id: number, language: "en-us" | "zh") {
        let opId = this.opId++;
        let url = `${this.esiUrl}/v3/universe/types/${id}/?datasource=${this.datasource}&language=${language}`
        this.logger.info(`${opId}| read TypeData id[${id}] lang[${language}] | ${url}`)
        let result = await fetch(url, { timeout: this.fetchTimeout })
        if (result.ok) {
            return result.json()
        } else {
            throw new Error(`${opId}| api access error: ${result.statusText}`)
        }
    }
    async processTypesPage(page: number) {
        let opId = this.opId++;
        this.logger.info(`${opId}| process type page ${page}`)
        let ids = await this.retry(() => {
            return this.apiGetTypeId(page)
        }, this.apiRetry)
        for (let id of ids) {
            try {
                this.logger.info(`process data for type ${id}`)
                let enData = await this.retry(() => {
                    return this.apiGetTypeData(id, "en-us");
                }, this.apiRetry)
                let cnData = await this.retry(() => {
                    return this.apiGetTypeData(id, "zh");
                }, this.apiRetry)
                this.extService.models.modelEveTQUniverseTypes.set(
                    id,
                    enData.name, enData.description, enData,
                    cnData.name, cnData.description, cnData
                )
            } catch (e) {
                this.logger.warn(e)
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
                await this.extService.models.modelKvs.set('runTaskUpdateTypeInfosProcessedPage', null)
            }
        }
    }
}