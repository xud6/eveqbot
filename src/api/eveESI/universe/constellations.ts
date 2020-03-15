import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "../types"
import * as t from 'io-ts'
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'
import { retryHandler } from "../retryHandler"
import got from "got"

export const vConstellationsGetIdsResult = t.array(t.Int)

export const vConstellationPosition = t.type({
    x: t.number,
    y: t.number,
    z: t.number
})
export interface tConstellationPosition extends t.TypeOf<typeof vConstellationPosition> { }
export const vConstellationsGetByIdResult = t.type({
    constellation_id: t.Int,
    name: t.string,
    position: vConstellationPosition,
    region_id: t.Int,
    systems: t.array(t.Int)
})
export interface tConstellationsGetByIdResult extends t.TypeOf<typeof vConstellationsGetByIdResult> { }

export class constellations {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["constellations"])
    }
    async getIds() {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/constellations/?datasource=${this.config.datasource}`
        this.logger.log(`${opId}| read universe/constellations | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout * 5 }).json()
            let validator = vConstellationsGetIdsResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
    async getById(id: number, language: tEveESILanguange) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/constellations/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read universe/constellations id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout }).json()
            let validator = vConstellationsGetByIdResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
}