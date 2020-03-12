import { modelKvs } from "../../models/modelKvs"
import { tLogger } from "tag-tree-logger"
import { isArray } from "lodash"
import fetch from "node-fetch"

export interface eveTQTypesInfoExtService {
    models: {
        modelKvs: modelKvs
    }
}


export class eveTypesInfo {
    readonly logger: tLogger
    timerTaskUpdateTypeInfos: NodeJS.Timeout | undefined
    timerTaskUpdateTypeInfosLock: boolean = false
    datasource = "tranquility"
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
    async update() { }
    async TaskUpdateTypeInfos() {
        if (this.timerTaskUpdateTypeInfosLock === false) {
            this.timerTaskUpdateTypeInfosLock = true
            let runTaskUpdateTypeInfos = await this.extService.models.modelKvs.get("runTaskUpdateTypeInfos");
            if (runTaskUpdateTypeInfos === "SCHEDULE" || runTaskUpdateTypeInfos === "YES" || runTaskUpdateTypeInfos === null) {
                this.logger.info(`TaskUpdateTypeInfos started`)
                let ids = await this.getTypeIds()
                this.logger.info(ids)
                // this.extService.models.modelKvs.set("runTaskUpdateTypeInfos", "IDLE")
            }

            this.timerTaskUpdateTypeInfosLock = false
        }
    }
    async apiGetTypeId(page: number) {
        let url = `https://esi.evetech.net/v1/universe/types/?datasource=${this.datasource}&page=${page}`
        this.logger.info(`read TypeId page ${page} | ${url}`)
        let result = await fetch(url)
        if (result.ok) {
            return result.json()
        } else {
            throw new Error(`api access error`)
        }
    }
    async getTypeIds() {
        let ids: number[] = []
        let processContinuse = true;
        let currentPage = 1;
        while (processContinuse) {
            processContinuse = false
            let retry = 5;
            let currentPageIds: number[] | null = null
            while (retry-- && (currentPageIds === null)) {
                try {
                    let result = await this.apiGetTypeId(currentPage);
                    if (isArray(result)) {
                        currentPageIds = result
                    }
                } catch (e) {
                    this.logger.warn(e)
                }
            }
            if (currentPageIds) {
                if (currentPageIds.length > 0) {
                    ids.concat(currentPageIds);
                    currentPage++;
                    processContinuse = true;
                }
            } else {
                throw new Error("page read failed")
            }
        }
        this.logger.info(`finish read [${ids.length}] TypeIds`)
        return ids
    }
}