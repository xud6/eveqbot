import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "../types"
import * as t from 'io-ts'
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'
import { retryHandler } from "../../../utils/retryHandler"
import got from "got"

export const vRegionsGetIdsResult = t.array(t.Int)

export const vRegionsGetByIdResultRequired = t.type({
    constellations: t.array(t.Int),
    name: t.string,
    region_id: t.Int,
})
export const vRegionsGetByIdResultOptional = t.partial({
    description: t.string,
})
export const vRegionsGetByIdResult = t.intersection([vRegionsGetByIdResultRequired, vRegionsGetByIdResultOptional])
export interface tRegionsGetByIdResult extends t.TypeOf<typeof vRegionsGetByIdResult> { }

export class regions {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["regions"])
    }
    async getIds() {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/regions/?datasource=${this.config.datasource}`
        this.logger.log(`${opId}| read universe/regions | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout * 5 }).json()
            let validator = vRegionsGetIdsResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e.message || e) })
    }
    async getById(id: number, language: tEveESILanguange) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/regions/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read universe/regions id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout }).json()
            let validator = vRegionsGetByIdResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e.message || e) })
    }
}