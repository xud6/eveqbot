import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "../types"
import * as t from 'io-ts'
import fetch from "node-fetch"
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'
import { retryHandler } from "../retryHandler"

export const vGroupsGetIdsResult = t.array(t.Int)
export const vGroupsGetByIdResult = t.type({
    category_id: t.Int,
    group_id: t.Int,
    name: t.string,
    published: t.boolean,
    types: t.array(t.Int),
})
export interface tGroupsGetByIdResult extends t.TypeOf<typeof vGroupsGetByIdResult> { }

export class groups {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["categories"])
    }
    async getIds(page: number) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/groups/?datasource=${this.config.datasource}&page=${page}`
        this.logger.log(`${opId}| read universe/groups id page ${page} | ${url}`)
        return await retryHandler(async () => {
            let result = await fetch(url, { timeout: this.config.fetchTimeout * 5 })
            if (result.ok) {
                let data = await result.json();
                let validator = vGroupsGetIdsResult.decode(data)
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
        let url = `${this.config.esiUrl}/v1/universe/groups/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read universe/groups id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await fetch(url, { timeout: this.config.fetchTimeout })
            if (result.ok) {
                let data = await result.json();
                let validator = vGroupsGetByIdResult.decode(data)
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