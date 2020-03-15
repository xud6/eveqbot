import { tLogger } from "tag-tree-logger";
import { tModelBase } from "./modelBase";
import { tModelsExtService, tModelsConfig } from "./types";
import { modelQQBotMessageLog } from "./modelQQBotMessageLog";
import { modelQQBotMessageSource } from "./modelQQBotMessageSource";
import { modelKvs } from "./modelKvs";
import { modelEveESIUniverseTypes } from "./modelEveESIUniverseTypes";
import { modelEveESIUniverseCategories } from "./modelEveESIUniverseCategories";
import { modelEveESIUniverseGroups } from "./modelEveESIUniverseGroups";
import { modelEveESIUniverseRegions } from "./modelEveESIUniverseRegions";
import { modelEveESIUniverseConstellations } from "./modelEveESIUniverseConstellations";
import { modelEveESIUniverseSystems } from "./modelEveESIUniverseSystems";

export class cModels {
    readonly logger: tLogger
    models: tModelBase[]
    modelQQBotMessageLog: modelQQBotMessageLog
    modelQQBotMessageSource: modelQQBotMessageSource
    modelKvs: modelKvs
    modelEveESIUniverseCategories: modelEveESIUniverseCategories
    modelEveESIUniverseGroups: modelEveESIUniverseGroups
    modelEveESIUniverseTypes: modelEveESIUniverseTypes
    modelEveESIUniverseRegions: modelEveESIUniverseRegions
    modelEveESIUniverseConstellations: modelEveESIUniverseConstellations
    modelEveESIUniverseSystems: modelEveESIUniverseSystems
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly config: tModelsConfig
    ) {
        this.logger = parentLogger.logger(["models"]);
        this.models = [];
        this.modelQQBotMessageLog = new modelQQBotMessageLog(this.logger, this.extService, this);
        this.models.push(this.modelQQBotMessageLog)
        this.modelQQBotMessageSource = new modelQQBotMessageSource(this.logger, this.extService, this);
        this.models.push(this.modelQQBotMessageSource)
        this.modelKvs = new modelKvs(this.logger, this.extService, this);
        this.models.push(this.modelKvs)
        this.modelEveESIUniverseCategories = new modelEveESIUniverseCategories(this.logger, this.extService, this);
        this.models.push(this.modelEveESIUniverseCategories)
        this.modelEveESIUniverseGroups = new modelEveESIUniverseGroups(this.logger, this.extService, this);
        this.models.push(this.modelEveESIUniverseGroups)
        this.modelEveESIUniverseTypes = new modelEveESIUniverseTypes(this.logger, this.extService, this);
        this.models.push(this.modelEveESIUniverseTypes)
        this.modelEveESIUniverseRegions = new modelEveESIUniverseRegions(this.logger, this.extService, this);
        this.models.push(this.modelEveESIUniverseRegions)
        this.modelEveESIUniverseConstellations = new modelEveESIUniverseConstellations(this.logger, this.extService, this);
        this.models.push(this.modelEveESIUniverseConstellations)
        this.modelEveESIUniverseSystems = new modelEveESIUniverseSystems(this.logger, this.extService, this);
        this.models.push(this.modelEveESIUniverseSystems)
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