import { tLogger } from "tag-tree-logger"
import { cModels } from "../models";
import { eveUniverse } from "./universe";

export interface eveUniverseExtService {
    models: cModels
}

export class eveTranquility {
    universe: eveUniverse
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: eveUniverseExtService
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