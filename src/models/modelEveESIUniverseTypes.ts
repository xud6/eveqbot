import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseTypes } from "../db/entity/eveESIUniverseTypes";
import { DeepPartial } from "typeorm";
import { tTypesGetByIdResult } from "../eveESI/universe/types";
import { modelKvs } from "./modelKvs";

export class modelEveESIUniverseTypes implements tModelBase {
    readonly name = "modelEveESIUniverseTypes"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseTypes"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number, forceRefresh: boolean = false): Promise<eveESIUniverseTypes | null> {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let result = (await repo.findByIds([id]))[0];
        if (result === undefined || forceRefresh) {
            this.logger.info(`update data for ${id}`)
            let enData = await this.extService.eveESI.universe.types.getById(id, "en-us");
            let cnData = await this.extService.eveESI.universe.types.getById(id, "zh");
            if (result === undefined) {
                result = repo.create()
                result.id = id;
            }
            result.group_id = enData.group_id;
            result.market_group_id = enData.market_group_id || null;
            result.published = enData.published;
            result.en_name = enData.name;
            result.cn_name = cnData.name;
            result.en_description = enData.description;
            result.cn_description = cnData.description;
            result.en_raw = enData;
            result.cn_raw = cnData;
            result.graphic_id = enData.graphic_id || null;
            result.icon_id = enData.icon_id || null;
            result.type_id = enData.type_id;
            await repo.save(result);
            result = (await repo.findByIds([id]))[0];
        }
        if (result) {
            return result
        } else {
            return null
        }
    }
    async RefreshData(kvs: modelKvs) {
        let inProcess = true;
        let currentPage = 1;
        let processedId = -1;
        try {
            let refreshProgressPageRecord = await kvs.get("modelEveESIUniverseTypes_refreshProgressPage");
            if (refreshProgressPageRecord) {
                currentPage = parseInt(refreshProgressPageRecord) + 1;
                let refreshProgressIdRecord = await kvs.get("modelEveESIUniverseTypes_refreshProgressPage");
                if (refreshProgressIdRecord) {
                    processedId = parseInt(refreshProgressIdRecord);
                }
            }
        } catch (e) { }

        while (inProcess) {
            inProcess = false;
            let ids = await this.extService.eveESI.universe.types.getIds(currentPage);

            if (ids.length > 0) {
                let cnt = 1;
                for (let id of ids) {
                    if (id > processedId) {
                        try {
                            this.logger.info(`update data for UniverseCategorie ${id} |P${currentPage} ${cnt++}/${ids.length}`);
                            await this.get(id, true);
                        } catch (e) {
                            this.logger.error(e);
                        }
                    } else {
                        await this.get(id);
                    }
                }
            } else {
                await kvs.set("modelEveESIUniverseTypes_refreshProgressPage", null);
                await kvs.set("modelEveESIUniverseTypes_refreshProgressId", null);
            }
        }
    }
}
