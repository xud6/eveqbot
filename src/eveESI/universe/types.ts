import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "./../types"
import * as t from 'io-ts'
import fetch from "node-fetch"
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
            let result = await fetch(url, { timeout: this.config.fetchTimeout * 5 })
            if (result.ok) {
                let data = await result.json();
                let validator = vTypesGetIdsResult.decode(data)
                if (isRight(validator)) {
                    return validator.right
                } else {
                    throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
                }
            } else {
                throw new Error(`${opId}| api access error: ${result.statusText}`)
            }
        }, this.config.fetchRetry, (e) => { this.logger.warn(e) })

    }
    async getById(id: number, language: tEveESILanguange) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v3/universe/types/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read TypeData id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await fetch(url, { timeout: this.config.fetchTimeout })
            if (result.ok) {
                let data = await result.json();
                let validator = vTypesGetByIdResult.decode(data)
                if (isRight(validator)) {
                    return validator.right
                } else {
                    throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
                }
            } else {
                throw new Error(`${opId}| api access error: ${result.statusText}`)
            }
        }, this.config.fetchRetry, (e) => { this.logger.warn(e) })
    }
}