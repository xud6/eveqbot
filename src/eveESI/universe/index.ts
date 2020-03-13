import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg } from "./../types"
import { types } from "./types"
import { categories } from "./categories"


export class universe {
    readonly logger: tLogger
    readonly types: types
    readonly categories: categories
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["universe"])
        this.types = new types(this.logger, extService, config)
        this.categories = new categories(this.logger, extService, config)
    }
}