import { tLogger } from "tag-tree-logger";
import { tModelBase } from "./modelBase";
import { tModelsExtService, tModelsConfig } from "./types";
import { modelQQBotMessageLog } from "./modelQQBotMessageLog";
import { modelQQBotMessageSource } from "./modelQQBotMessageSource";
import { modelKvs } from "./modelKvs";
import { modelEveESIUniverseTypes } from "./modelEveESIUniverseTypes";
import { modelEveESIUniverseCategories } from "./modelEveESIUniverseCategories";

export class cModels {
    readonly logger: tLogger
    models: tModelBase[]
    modelQQBotMessageLog: modelQQBotMessageLog
    modelQQBotMessageSource: modelQQBotMessageSource
    modelKvs: modelKvs
    modelEveESIUniverseTypes: modelEveESIUniverseTypes
    modelEveESIUniverseCategories: modelEveESIUniverseCategories
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly config: tModelsConfig
    ) {
        this.logger = parentLogger.logger(["models"]);
        this.models = [];
        this.modelQQBotMessageLog = new modelQQBotMessageLog(this.logger, this.extService);
        this.models.push(this.modelQQBotMessageLog)
        this.modelQQBotMessageSource = new modelQQBotMessageSource(this.logger, this.extService);
        this.models.push(this.modelQQBotMessageSource)
        this.modelKvs = new modelKvs(this.logger, this.extService);
        this.models.push(this.modelKvs)
        this.modelEveESIUniverseTypes = new modelEveESIUniverseTypes(this.logger, this.extService);
        this.models.push(this.modelEveESIUniverseTypes)
        this.modelEveESIUniverseCategories = new modelEveESIUniverseCategories(this.logger, this.extService);
        this.models.push(this.modelEveESIUniverseCategories)
    }
    async startup() {
        for (let model of this.models) {
            await model.startup()
        }
    }
    async shutdown() {
        for (let model of this.models) {
            await model.shutdown()
        }
    }
}