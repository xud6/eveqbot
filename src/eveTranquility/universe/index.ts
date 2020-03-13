import { tLogger } from "tag-tree-logger"
import { eveTranquilityExtService } from "../types";


export class eveUniverse {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: eveTranquilityExtService
    ) {
        this.logger = parentLogger.logger(["universe"])
    }
    async startup() {
    }
    async shutdown() {
    }
}