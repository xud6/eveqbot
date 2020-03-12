import { modelKvs } from "../../models/modelKvs"
import { tLogger } from "tag-tree-logger"


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

                // this.extService.models.modelKvs.set("runTaskUpdateTypeInfos", "IDLE")
            }

            this.timerTaskUpdateTypeInfosLock = false
        }
    }
    async apiGetTypeId(page: number) {
        let result = await fetch(`https://esi.evetech.net/latest/universe/types/?datasource=${this.datasource}&page=${page}`)
        if (result.ok) {
            return result.json()
        } else {
            throw new Error(`api access error`)
        }
    }
    async getTypeIds() {

    }
}