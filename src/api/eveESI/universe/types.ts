import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "../types"
import * as t from 'io-ts'
import got from "got"
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'
import { retryHandler } from "../retryHandler"

export const vTypesGetIdsResult = t.array(t.Int)
export const vTypesGetByIdResultRequired = t.type({
    description: t.string,
    group_id: t.Int,
    name: t.string,
    published: t.boolean,
    type_id: t.Int,
})
export const vTypesGetByIdResultOptional = t.partial({
    capacity: t.number,
    dogma_attributes: t.any,
    dogma_effects: t.any,
    graphic_id: t.Int,
    icon_id: t.Int,
    market_group_id: t.Int,
    mass: t.number,
    packaged_volume: t.number,
    portion_size: t.Int,
    radius: t.number,
    volume: t.number
})
export const vTypesGetByIdResult = t.intersection([vTypesGetByIdResultRequired, vTypesGetByIdResultOptional])
export interface tTypesGetByIdResult extends t.TypeOf<typeof vTypesGetByIdResult> { }

export class types {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["types"])
    }
    async getIds(page: number) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/types/?datasource=${this.config.datasource}&page=${page}`
        this.logger.log(`${opId}| read TypeId page ${page} | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout * 5 }).json()
            let validator = vTypesGetIdsResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })

    }
    async getById(id: number, language: tEveESILanguange) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v3/universe/types/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read TypeData id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout }).json()
            let validator = vTypesGetByIdResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
}