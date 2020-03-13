import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseCategories } from "../db/entity/eveESIUniverseCategories";

export class modelEveESIUniverseCategories implements tModelBase {
    readonly name = "modelEveESIUniverseCategories"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseCategories"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number, forceRefresh: boolean): Promise<eveESIUniverseCategories | null> {
        let repo = await this.extService.db.getRepository(eveESIUniverseCategories);
        let result = (await repo.findByIds([id]))[0];
        if (result === undefined || forceRefresh) {
            let enData = await this.extService.eveESI.universe.categories.getById(id, "en-us");
            let cnData = await this.extService.eveESI.universe.categories.getById(id, "zh");
            if (result === undefined) {
                result = repo.create()
                result.id = id
            }
            result.category_id = enData.category_id
            result.published = enData.published
            result.en_name = enData.name
            result.cn_name = cnData.name
            result.en_raw = enData
            await repo.save(result)
            result = (await repo.findByIds([id]))[0];
        }
        if (result) {
            return result
        } else {
            return null
        }
    }
    async RefreshData() {
        let ids = await this.extService.eveESI.universe.categories.getIds();
        let cnt = 1;
        for (let id of ids) {
            try {
                this.logger.info(`update data for UniverseCategorie ${id} | ${cnt++}/${ids.length}`);
                await this.get(id, true);
            } catch (e) {
                this.logger.error(e);
            }
        }
    }
}
