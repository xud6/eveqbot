import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "../types"
import * as t from 'io-ts'
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'
import { retryHandler } from "../../../utils/retryHandler"
import got from "got"

export const vCategoriesGetIdsResult = t.array(t.Int)
export const vCategoriesGetByIdResult = t.type({
    category_id: t.Int,
    name: t.string,
    published: t.boolean,
    groups: t.array(t.Int),
})
export interface tCategoriesGetByIdResult extends t.TypeOf<typeof vCategoriesGetByIdResult> { }

export class categories {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["categories"])
    }
    async getIds() {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/categories/?datasource=${this.config.datasource}`
        this.logger.log(`${opId}| read universe/categories | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout * 5 }).json()
            let validator = vCategoriesGetIdsResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
    async getById(id: number, language: tEveESILanguange) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/categories/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read universe/categories id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout }).json()
            let validator = vCategoriesGetByIdResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
}