import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseTypes } from "../db/entity/eveESIUniverseTypes";
import { Brackets } from "typeorm";
import { cModels } from ".";
import PQueue from "p-queue";
import { eveIsSkins, eveIsBlueprint, eveCommonNameTransfer } from "../utils/eveFuncs";
import { spliteWords } from "../utils/spliteWords";
import { uniq } from "lodash";

export interface tMarketSearchMatchType {
    en: string,
    cn: string
}

const marketSearchMatchTypeID = { en: "ID", cn: "ID" }
const marketSearchMatchTypeExactName = { en: "ExactName", cn: "准确物品名" }
const marketSearchMatchTypePhrase = { en: "Phrase", cn: "短语" }
const marketSearchMatchTypeWords = { en: "Words", cn: "字符匹配" }

export interface tMarketSearchResult {
    types: eveESIUniverseTypes[],
    matchType: tMarketSearchMatchType | null
}

export class modelEveESIUniverseTypes implements tModelBase {
    readonly name = "modelEveESIUniverseTypes"
    readonly logger: tLogger
    typesUpdateInterval: number = 1000 * 60 * 60 * 24 * 5
    typesUpdateTimer: NodeJS.Timeout | undefined
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseTypes"])
    }
    async startup() {
        this.typesUpdateTimer = setInterval(() => {
            this.RefreshData(false)
        }, this.typesUpdateInterval)
    }
    async shutdown() {
        if (this.typesUpdateTimer) {
            clearInterval(this.typesUpdateTimer)
        }
    }
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
            result.name_en = enData.name;
            result.name_cn = cnData.name;
            result.description_en = enData.description;
            result.description_cn = cnData.description;
            result.graphic_id = enData.graphic_id || null;
            result.icon_id = enData.icon_id || null;
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
    async searchById(id: number, onlyMarketable: boolean = true) {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let query = repo.createQueryBuilder("type")
            .where(`type.published = :is_published`, { is_published: true })
        if (onlyMarketable) {
            query = query.andWhere(`type.market_group_id <> :not_market_group_id`, { not_market_group_id: "null" })
        }
        query = query
            .andWhere(`type.id = :typeid`, { typeid: id })
            .leftJoinAndSelect("type.group", "group")
            .leftJoinAndSelect("group.category", "category")
            .select([
                "type.id",
                "type.name_en",
                "type.name_cn",
                "group.id",
                "group.name_en",
                "group.name_cn",
                "category.id",
                "category.name_en",
                "category.name_cn"
            ])
        return await query.getMany()
    }
    async searchByExactName(name: string, limit: number = 51, onlyMarketable: boolean = true) {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let query = repo.createQueryBuilder("type")
            .where(`type.published = :is_published`, { is_published: true })
        if (onlyMarketable) {
            query = query.andWhere(`type.market_group_id <> :not_market_group_id`, { not_market_group_id: "null" })
        }
        query = query
            .andWhere(new Brackets(qb => {
                qb.where(`type.name_en = :name`)
                    .orWhere(`type.name_cn = :name`)
            })).setParameter(`name`, `${name}`)
            .limit(limit)
            .leftJoinAndSelect("type.group", "group")
            .leftJoinAndSelect("group.category", "category")
            .select([
                "type.id",
                "type.name_en",
                "type.name_cn",
                "group.id",
                "group.name_en",
                "group.name_cn",
                "category.id",
                "category.name_en",
                "category.name_cn"
            ])
        return await query.getMany()
    }
    async SearchByWords(
        words: string[],
        limit: number = 51,
        skins: boolean = false,
        blueprint: boolean = false,
        apparel: boolean = false,
        onlyMarketable: boolean = true
    ) {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let query = repo.createQueryBuilder("type")
            .where(`type.published = :is_published`, { is_published: true })

        if (onlyMarketable) {
            query = query.andWhere(`type.market_group_id <> :not_market_group_id`, { not_market_group_id: "null" })
        }
        query = query
            .leftJoinAndSelect("type.group", "group")
            .leftJoinAndSelect("group.category", "category")
            .select([
                "type.id",
                "type.name_en",
                "type.name_cn",
                "group.id",
                "group.name_en",
                "group.name_cn",
                "category.id",
                "category.name_en",
                "category.name_cn"
            ])
        if (skins === false) {
            query = query.andWhere(`group.category_id <> :skid_category_id`, { skid_category_id: 91 })
        }
        if (blueprint === false) {
            query = query.andWhere(`group.category_id <> :blueprint_category_id`, { blueprint_category_id: 9 })
        }
        if (apparel === false) {
            query = query.andWhere(`group.category_id <> :apparel_category_id`, { apparel_category_id: 30 })
        }
        let wordcnt = 1
        for (let word of words) {
            let cnt = wordcnt++;
            query = query.andWhere(new Brackets(qb => {
                qb.where(`type.name_en LIKE :word${cnt}`)
                    .orWhere(`type.name_cn LIKE :word${cnt}`)
            })).setParameter(`word${cnt}`, `%${word}%`)
        }
        query = query.limit(limit)
        return await query.getMany()
    }
    private async doSearchCombined(
        opId: number,
        input: string,
        limit: number = 51,
        onlyMarketable: boolean = true
    ): Promise<tMarketSearchResult> {
        let result
        try {
            let inputId = parseInt(input);
            if (inputId) {
                this.logger.log(`${opId}| parsed id [${inputId}] from input [${input}]`)
                result = await this.searchById(inputId, onlyMarketable);
                if (result.length > 0) {
                    this.logger.info(`${opId}| Find [${result.length}] result by Id for [${input}]`)
                    return {
                        types: result,
                        matchType: marketSearchMatchTypeID
                    }
                }
            }
        } catch (e) { }
        result = await this.searchByExactName(input, limit, onlyMarketable)
        if (result.length > 0) {
            this.logger.info(`${opId}| Find [${result.length}] result by ExactName for [${input}]`)
            return {
                types: result,
                matchType: marketSearchMatchTypeExactName
            }
        }
        let isSkin = eveIsSkins(input);
        let isBlueprint = eveIsBlueprint(input);
        result = await this.SearchByWords([input], limit, isSkin, isBlueprint, false, onlyMarketable)
        if (result.length > 0) {
            this.logger.info(`${opId}| Find [${result.length}] result by Word for [${input}]`)
            return {
                types: result,
                matchType: marketSearchMatchTypePhrase
            }
        }
        let inputT = eveCommonNameTransfer(input);
        if (inputT === input) {
            result = await this.SearchByWords(spliteWords(input), limit, isSkin, isBlueprint, false, onlyMarketable)
            if (result.length > 0) {
                this.logger.info(`${opId}| Find [${result.length}] result by SpliteWords without CommonName for [${input}]`)
                return {
                    types: result,
                    matchType: marketSearchMatchTypeWords
                }
            }
        } else {
            let pResultO = this.SearchByWords(spliteWords(input), limit, isSkin, isBlueprint, false, onlyMarketable)
            let pResultT = this.SearchByWords(spliteWords(inputT), limit, isSkin, isBlueprint, false, onlyMarketable)
            result = uniq((await pResultO).concat(await pResultT))
            if (result.length > 0) {
                this.logger.info(`${opId}| Find [${result.length}] result by SpliteWords with CommonName for [${input}]`)
                return {
                    types: result,
                    matchType: marketSearchMatchTypeWords
                }
            }
        }
        return {
            types: [],
            matchType: null
        };
    }
    async SearchCombined(
        opId: number,
        input: string,
        limit: number = 51,
        onlyMarketable: boolean = true
    ): Promise<tMarketSearchResult> {
        this.logger.info(`${opId}| market search for ${input} in UniverseType`)
        let result = await this.doSearchCombined(opId, input, limit, onlyMarketable)
        for (let r of result.types) {
            this.logger.log(`${opId}| ID:${r.id}|${r.name_cn}|${r.name_en}|${r.group.name_cn}|${r.group.category.name_cn}`)
        }
        return result
    }
    async MarketSearch(
        opId: number,
        input: string,
        limit: number = 51
    ): Promise<tMarketSearchResult> {
        return this.SearchCombined(opId, input, limit, true)
    }
    async SearchByGroupNames(
        words: string[],
        limit: number = 51,
        onlyMarketable: boolean = true
    ) {
        let repo = await this.extService.db.getRepository(eveESIUniverseTypes);
        let query = repo.createQueryBuilder("type")
            .where(`type.published = :is_published`, { is_published: true })

        if (onlyMarketable) {
            query = query.andWhere(`type.market_group_id <> :not_market_group_id`, { not_market_group_id: "null" })
        }
        query = query
            .leftJoinAndSelect("type.group", "group")
            .leftJoinAndSelect("group.category", "category")
            .select([
                "type.id",
                "type.name_en",
                "type.name_cn",
                "group.id",
                "group.name_en",
                "group.name_cn",
                "category.id",
                "category.name_en",
                "category.name_cn"
            ])
        let wordcnt = 1
        for (let word of words) {
            let cnt = wordcnt++;
            query = query.andWhere(new Brackets(qb => {
                qb.where(`group.name_en LIKE :word${cnt}`)
                    .orWhere(`group.name_cn LIKE :word${cnt}`)
                    .orWhere(`category.name_en LIKE :word${cnt}`)
                    .orWhere(`category.name_cn LIKE :word${cnt}`)
            })).setParameter(`word${cnt}`, `%${word}%`)
        }
        query = query.limit(limit)
        return await query.getMany()
    }
}
