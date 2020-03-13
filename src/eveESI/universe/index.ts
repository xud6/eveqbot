import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg } from "./../types"
import { types } from "./types"


export class universe {
    readonly logger: tLogger
    readonly types: types
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["universe"])
        this.types = new types(this.logger, extService, config)
    }
}