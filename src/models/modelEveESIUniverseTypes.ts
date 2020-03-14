import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseTypes } from "../db/entity/eveESIUniverseTypes";
import { DeepPartial, Brackets } from "typeorm";
import { tTypesGetByIdResult } from "../eveESI/universe/types";
import { modelKvs } from "./modelKvs";
import { cModels } from ".";
import PQueue from "p-queue";

export class modelEveESIUniverseTypes implements tModelBase {
    readonly name = "modelEveESIUniverseTypes"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseTypes"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number, forceRefresh: boolean = false): Promise<eveESIUniverseTypes | null> {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let result = (await repo.findByIds([id]))[0];
        if (result === undefined || forceRefresh) {
            this.logger.info(`update ${id} because of ${result ? "" : "|data not exist"}${forceRefresh ? "|force refresh" : ""}`)

            let enDataP = this.extService.eveESI.universe.types.getById(id, "en-us");
            let cnDataP = this.extService.eveESI.universe.types.getById(id, "zh");
            let enData = await enDataP;
            let cnData = await cnDataP;

            if (result === undefined) {
                result = repo.create()
                result.id = id;
            }
            // result.group_id = enData.group_id;
            let group = await this.models.modelEveESIUniverseGroups.get(enData.group_id)
            if (group) {
                result.group = group;
            } else {
                throw new Error(`group ${result.group_id} not find for type ${id}`)
            }
            result.market_group_id = enData.market_group_id || null;
            result.published = enData.published;
            result.en_name = enData.name;
            result.cn_name = cnData.name;
            result.en_description = enData.description;
            result.cn_description = cnData.description;
            result.graphic_id = enData.graphic_id || null;
            result.icon_id = enData.icon_id || null;
            result.type_id = enData.type_id;
            result.capacity = enData.capacity || null;
            result.mass = enData.mass || null;
            result.packaged_volume = enData.packaged_volume || null;
            result.portion_size = enData.portion_size || null;
            result.radius = enData.radius || null;
            result.volume = enData.volume || null;
            result.dogma_attributes = enData.dogma_attributes || null;
            result.dogma_effects = enData.dogma_effects || null;

            await repo.save(result);
            result = (await repo.findByIds([id]))[0];
        }
        if (result) {
            return result
        } else {
            return null
        }
    }
    async RefreshData(forceRefresh: boolean = false, concurrency: number = 5) {
        let inProcess = true;
        let currentPage = 1;

        const queue = new PQueue({ concurrency: concurrency });
        let total = 0;
        let complete = 1;
        while (inProcess) {
            inProcess = false;
            this.logger.info(`start refresh page ${currentPage}`)
            let ids = await this.extService.eveESI.universe.types.getIds(currentPage);
            if (ids.length > 0) {
                total += ids.length;
                for (let id of ids) {
                    (async () => {
                        try {
                            await queue.add(async () => {
                                await this.get(id, forceRefresh);
                            });
                            this.logger.info(`complete update data for UniverseTypes ${id} |${complete++}/${total}`);
                        } catch (e) {
                            this.logger.error(e);
                        }
                    })();
                }
                currentPage++;
                inProcess = true
            } else {
                this.logger.info(`refresh complete`)
            }
        }
        await queue.onIdle();
        this.logger.info(`update data for UniverseTypes complete`)
    }
    async MarketSearchByExactName(name: string, limit: number = 11) {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let query = repo.createQueryBuilder("type")
            .where(`type.market_group_id <> :not_market_group_id`, { not_market_group_id: "null" })
            .andWhere(`type.published = :is_published`, { is_published: true })
            .leftJoinAndSelect("type.group", "group")
            .leftJoinAndSelect("group.category", "category")
            .select([
                "type.id",
                "type.en_name",
                "type.cn_name",
                "group.id",
                "group.en_name",
                "group.cn_name",
                "category.id",
                "category.en_name",
                "category.cn_name"
            ])
            .andWhere(new Brackets(qb => {
                qb.where(`type.cn_name = :name`)
                    .orWhere(`type.en_name = :name`)
            })).setParameter(`name`, `${name}`)
            .limit(limit)
        return await query.getMany()
    }
    async MarketSearchByWords(
        words: string[],
        limit: number = 11,
        skins: boolean = false,
        blueprint: boolean = false,
        apparel: boolean = false
    ) {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let query = repo.createQueryBuilder("type")
            .where(`type.market_group_id <> :not_market_group_id`, { not_market_group_id: "null" })
            .andWhere(`type.published = :is_published`, { is_published: true })
            .leftJoinAndSelect("type.group", "group")
            .leftJoinAndSelect("group.category", "category")
            .select([
                "type.id",
                "type.en_name",
                "type.cn_name",
                "group.id",
                "group.en_name",
                "group.cn_name",
                "category.id",
                "category.en_name",
                "category.cn_name"
            ])
        if (skins === false) {
            query = query.andWhere(`category.id <> :skid_category_id`, { skid_category_id: 91 })
        }
        if (blueprint === false) {
            query = query.andWhere(`category.id <> :blueprint_category_id`, { blueprint_category_id: 9 })
        }
        if (apparel === false) {
            query = query.andWhere(`category.id <> :apparel_category_id`, { apparel_category_id: 30 })
        }
        let namecnt = 1
        for (let name of words) {
            let cnt = namecnt++;
            query = query.andWhere(new Brackets(qb => {
                qb.where(`type.cn_name LIKE :name${cnt}`)
                    .orWhere(`type.en_name LIKE :name${cnt}`)
            })).setParameter(`name${cnt}`, `%${name}%`)
        }
        query = query.limit(limit)
        return await query.getMany()
    }
}
