import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveTQUniverseTypes } from "../db/entity/eveTQUniverseTypes";

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
        id: number,
        en_name: string, en_description: string, en_raw: any,
        cn_name: string, cn_description: string, cn_raw: any,
    ) {
        let repo = await this.extService.db.getRepository(eveTQUniverseTypes);
        let record = await repo.findOne(id);
        if (record) {
            let changed = false;
            if (record.en_name !== en_name) {
                record.en_name = en_name;
                changed = true;
            }
            if (record.en_description !== en_description) {
                record.en_description = en_description;
                changed = true;
            }
            if (JSON.stringify(record.en_raw) !== JSON.stringify(en_raw)) {
                record.en_raw = en_raw;
                changed = true;
            }
            if (record.cn_name !== cn_name) {
                record.cn_name = cn_name;
                changed = true;
            }
            if (record.cn_description !== cn_description) {
                record.cn_description = cn_description;
                changed = true;
            }
            if (JSON.stringify(record.cn_raw) !== JSON.stringify(cn_raw)) {
                record.cn_raw = cn_raw;
                changed = true;
            }
            if (changed) {
                repo.save(record);
            }
        } else {
            record = repo.create({
                id: id,
                en_name: en_name,
                en_description: en_description,
                en_raw: en_raw,
                cn_name: cn_name,
                cn_description: cn_description,
                cn_raw: cn_raw
            });
            repo.save(record)
        }
    }
}
