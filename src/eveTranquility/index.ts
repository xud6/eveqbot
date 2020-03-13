import { tLogger } from "tag-tree-logger"
import { eveUniverse } from "./universe";
import { eveTranquilityExtService } from "./types";

export class eveTranquility {
    universe: eveUniverse
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: eveTranquilityExtService
    ) {
        this.logger = parentLogger.logger(["eveTranquility"])
        this.universe = new eveUniverse(this.logger, this.extService)
    }
    async startup() {
        await this.universe.startup()
    }
    async shutdown() {
        await this.universe.shutdown()
    }
}