import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { kvs } from "../db/entity/kvs";
import { tMessageInfo } from "../bot";
import { cModels } from ".";

interface tMessageSourceInfo {
    source_type: string,
    source_id: number
}


export class modelKvs implements tModelBase {
    readonly name = "modelKvs"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelKvs"])
    }
    async startup() { }
    async shutdown() { }
    async get(key: string): Promise<string | null> {
        let repo = await this.extService.db.getRepository(kvs);
        let result = await repo.findOne({
            where: {
                key: key
            }
        })
        if (result) {
            return result.value
        } else {
            return null
        }
    }
    async set(key: string, value: string | null) {
        let repo = await this.extService.db.getRepository(kvs);
        if (value === null) {
            await repo.delete({ key: key });
        } else {
            let record = await repo.findOne({
                where: {
                    key: key
                }
            })
            if (record) {
                if (record.value !== value) {
                    record.value = value;
                    await repo.save(record)
                }
            } else {
                record = repo.create({
                    key: key,
                    value: value
                })
                await repo.save(record)
            }
        }
    }
}
