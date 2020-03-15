import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { eveESIUniverseSystems } from "../db/entity/eveESIUniverseSystems";
import { cModels } from ".";
import PQueue from "p-queue";

export class modelEveESIUniverseSystems implements tModelBase {
    readonly name = "modelEveESIUniverseSystems"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelEveESIUniverseSystems"])
    }
    async startup() { }
    async shutdown() { }
    async get(id: number, forceRefresh: boolean = false): Promise<eveESIUniverseSystems | null> {
        let repo = await this.extService.db.getRepository(eveESIUniverseSystems);
        let result = (await repo.findByIds([id]))[0];
        if (result === undefined || forceRefresh) {
            let enData = await this.extService.eveESI.universe.systems.getById(id, "en-us");
            let cnData = await this.extService.eveESI.universe.systems.getById(id, "zh");
            let constellation = await this.models.modelEveESIUniverseConstellations.get(enData.constellation_id)
            if (constellation) {
                if (result === undefined) {
                    result = repo.create()
                    result.id = id
                }
                result.constellation = constellation
                result.name_en = enData.name
                result.name_cn = cnData.name
                result.planets_raw = enData.planets || null
                result.position = enData.position
                result.security_class = enData.security_class || null
                result.security_status = enData.security_status
                result.star_id = enData.star_id || null
                result.stargates = enData.stargates || null
                result.stations = enData.stations || null
                await repo.save(result)
                result = (await repo.findByIds([id]))[0];
            } else {
                throw new Error(`Constellation not found for system ${id}, expected constellation id ${enData.constellation_id}`)
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
        let ids = await this.extService.eveESI.universe.systems.getIds();
        let total = ids.length;
        let complete = 1;
        for (let id of ids) {
            (async () => {
                try {
                    await queue.add(async () => {
                        await this.get(id, forceRefresh);
                    });
                    this.logger.info(`complete update data for UniverseSystems ${id} |${complete++}/${total}`);
                } catch (e) {
                    this.logger.error(e);
                }
            })();
        }
        await queue.onIdle();
        this.logger.info(`update data for UniverseSystems complete`)
    }
}