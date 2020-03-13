import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg } from "./types"
import { universe } from "./universe"


export class eveESI {
    private readonly logger: tLogger
    readonly universe: universe
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["ESI"])
        this.universe = new universe(this.logger, extService, config)
    }
}