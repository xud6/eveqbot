import { tLogger } from "tag-tree-logger"
import { eveTypesInfo } from "./typesInfo";
import { eveTranquilityExtService } from "../types";


export class eveUniverse {
    readonly logger: tLogger
    typesInfo: eveTypesInfo
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: eveTranquilityExtService
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