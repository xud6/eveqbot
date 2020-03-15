import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseConstellations } from "../db/entity/eveESIUniverseConstellations";
import { cModels } from ".";
import PQueue from "p-queue";

export class modelEveESIUniverseConstellations implements tModelBase {
    readonly name = "modelEveESIUniverseConstellations"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseConstellations"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number, forceRefresh: boolean = false): Promise<eveESIUniverseConstellations | null> {
        let repo = await this.extService.db.getRepository(eveESIUniverseConstellations);
        let result = (await repo.findByIds([id]))[0];
        if (result === undefined || forceRefresh) {
            let enData = await this.extService.eveESI.universe.constellations.getById(id, "en-us");
            let cnData = await this.extService.eveESI.universe.constellations.getById(id, "zh");
            let region = await this.models.modelEveESIUniverseRegions.get(enData.region_id);
            if (region) {
                if (result === undefined) {
                    result = repo.create()
                    result.id = id
                }
                result.name_en = enData.name
                result.name_cn = cnData.name
                result.position = enData.position
                result.region = region
                await repo.save(result)
                result = (await repo.findByIds([id]))[0];
            } else {
                throw new Error(`Region not found for constellation ${id}, expected region id ${enData.region_id}`)
            }
        }
        if (result) {
            return result
        } else {
            return null
        }
    }
    async RefreshData(forceRefresh: boolean = false, concurrency: number = 5) {
        const queue = new PQueue({ concurrency: concurrency });
        let ids = await this.extService.eveESI.universe.constellations.getIds();
        let total = ids.length;
        let complete = 1;
        for (let id of ids) {
            (async () => {
                try {
                    await queue.add(async () => {
                        await this.get(id, forceRefresh);
                    });
                    this.logger.info(`complete update data for UniverseConstellations ${id} |${complete++}/${total}`);
                } catch (e) {
                    this.logger.error(e);
                }
            })();
        }
        await queue.onIdle();
        this.logger.info(`update data for UniverseConstellations complete`)
    }
}
