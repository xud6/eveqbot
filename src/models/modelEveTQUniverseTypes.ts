import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveTQUniverseTypes } from "../db/entity/eveTQUniverseTypes";
import { DeepPartial } from "typeorm";

export class modelEveTQUniverseTypes implements tModelBase {
    readonly name = "modelEveTQUniverseTypes"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
    ) {
        this.logger = parentLogger.logger(["modelEveTQUniverseTypes"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number): Promise<eveTQUniverseTypes | null> {
        let repo = await this.extService.db.getRepository(eveTQUniverseTypes);
        let result = await repo.findOne(id);
        if (result) {
            return result
        } else {
            return null
        }
    }
    async set(
        id: number, en_raw: any, cn_raw: any,
    ) {
        let repo = await this.extService.db.getRepository(eveTQUniverseTypes);
        let record = await repo.findOne(id);
        if (record) {
            let changed = false;

            if (record.graphic_id !== en_raw.graphic_id || null) {
                record.graphic_id = en_raw.graphic_id || null;
                changed = true;
            }
            if (record.group_id !== en_raw.group_id) {
                record.group_id = en_raw.group_id;
                changed = true;
            }
            if (record.icon_id !== en_raw.icon_id || null) {
                record.icon_id = en_raw.icon_id || null;
                changed = true;
            }
            if (record.market_group_id !== en_raw.market_group_id || null) {
                record.market_group_id = en_raw.market_group_id || null;
                changed = true;
            }
            if (record.published !== en_raw.published) {
                record.published = en_raw.published;
                changed = true;
            }
            if (record.type_id !== en_raw.type_id) {
                record.type_id = en_raw.type_id;
                changed = true;
            }

            if (record.en_name !== en_raw.name) {
                record.en_name = en_raw.name;
                changed = true;
            }
            if (record.en_description !== en_raw.description) {
                record.en_description = en_raw.description;
                changed = true;
            }
            if (JSON.stringify(record.en_raw) !== JSON.stringify(en_raw)) {
                record.en_raw = en_raw;
                changed = true;
            }
            if (record.cn_name !== cn_raw.name) {
                record.cn_name = cn_raw.name;
                changed = true;
            }
            if (record.cn_description !== cn_raw.description) {
                record.cn_description = cn_raw.description;
                changed = true;
            }
            if (JSON.stringify(record.cn_raw) !== JSON.stringify(cn_raw)) {
                record.cn_raw = cn_raw;
                changed = true;
            }
            if (changed) {
                await repo.save(record);
            }
        } else {
            let record: DeepPartial<eveTQUniverseTypes> = {
                id: id
            }
            let changed = false;
            if (record.en_name !== en_raw.name) {
                record.en_name = en_raw.name;
                changed = true;
            }
            if (record.en_description !== en_raw.description) {
                record.en_description = en_raw.description;
                changed = true;
            }
            if (JSON.stringify(record.en_raw) !== JSON.stringify(en_raw)) {
                record.en_raw = en_raw;
                changed = true;
            }
            if (record.cn_name !== cn_raw.name) {
                record.cn_name = cn_raw.name;
                changed = true;
            }
            if (record.cn_description !== cn_raw.description) {
                record.cn_description = cn_raw.description;
                changed = true;
            }
            if (JSON.stringify(record.cn_raw) !== JSON.stringify(cn_raw)) {
                record.cn_raw = cn_raw;
                changed = true;
            }
            await repo.save(repo.create(record))
        }
    }
}
