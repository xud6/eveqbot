import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseGroups } from "../db/entity/eveESIUniverseGroups";
import { cModels } from ".";

export class modelEveESIUniverseGroups implements tModelBase {
    readonly name = "modelEveESIUniverseGroups"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseGroups"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number, forceRefresh: boolean = false): Promise<eveESIUniverseGroups | null> {
        let repo = await this.extService.db.getRepository(eveESIUniverseGroups);
        let result = (await repo.findByIds([id]))[0];
        if (result === undefined || forceRefresh) {
            this.logger.info(`update ${id} because of |${result ? "" : "data not exist"}|${forceRefresh ? "force refresh" : ""}|`)

            let enDataP = this.extService.eveESI.universe.groups.getById(id, "en-us");
            let cnDataP = this.extService.eveESI.universe.groups.getById(id, "zh");
            let enData = await enDataP;
            let cnData = await cnDataP;

            if (result === undefined) {
                result = repo.create()
                result.id = id;
            }
            // result.category_id = enData.category_id
            let category = await this.models.modelEveESIUniverseCategories.get(enData.category_id);
            if (category) {
                result.category = category
            } else {
                throw new Error(`Category ${result.category_id} not found for group ${id}`)
            }
            result.group_id = enData.group_id
            result.en_name = enData.name
            result.cn_name = cnData.name
            result.published = enData.published
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
        let inProcess = true;
        let currentPage = 1;
        let processedId = -1;
        try {
            let refreshProgressPageRecord = await this.models.modelKvs.get("modelEveESIUniverseGroups_refreshProgressPage");
            if (refreshProgressPageRecord) {
                currentPage = parseInt(refreshProgressPageRecord) + 1;
                this.logger.info(`continuse last transaction from page ${currentPage}`)
            }

            let refreshProgressIdRecord = await this.models.modelKvs.get("modelEveESIUniverseGroups_refreshProgressId");
            if (refreshProgressIdRecord) {
                processedId = parseInt(refreshProgressIdRecord);
                this.logger.info(`continuse last transaction from id ${processedId}`)
            }
        } catch (e) { }

        while (inProcess) {
            inProcess = false;
            this.logger.info(`start refresh page ${currentPage}`)
            let ids = await this.extService.eveESI.universe.groups.getIds(currentPage);

            if (ids.length > 0) {
                let cnt = 1;
                for (let id of ids) {
                    if (id > processedId) {
                        try {
                            this.logger.info(`update data for UniverseGroups ${id} |P${currentPage} ${cnt++}/${ids.length}`);
                            await this.get(id, true);
                            await this.models.modelKvs.set("modelEveESIUniverseGroups_refreshProgressId", id.toString());
                        } catch (e) {
                            this.logger.error(e);
                        }
                    } else {
                        await this.get(id);
                    }
                }
                await this.models.modelKvs.set("modelEveESIUniverseGroups_refreshProgressPage", currentPage.toString());
                currentPage++;
                inProcess = true
            } else {
                await this.models.modelKvs.set("modelEveESIUniverseGroups_refreshProgressPage", null);
                await this.models.modelKvs.set("modelEveESIUniverseGroups_refreshProgressId", null);
                this.logger.info(`refresh complete`)
            }
        }
    }
}
