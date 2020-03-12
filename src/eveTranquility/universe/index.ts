import { tLogger } from "tag-tree-logger"
import { cModels } from "../../models";
import { eveTypesInfo } from "./typesInfo";


export interface eveUniverseExtService {
    models: cModels
}

export class eveUniverse {
    readonly logger: tLogger
    typesInfo: eveTypesInfo
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: eveUniverseExtService
    ) {
        this.logger = parentLogger.logger(["universe"])
        this.typesInfo = new eveTypesInfo(this.logger, this.extService)
    }
    async startup() {
        await this.typesInfo.startup()
    }
    async shutdown() {
        await this.typesInfo.shutdown()
    }
}