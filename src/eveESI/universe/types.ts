import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg } from "./../types"
import * as t from 'io-ts'
import fetch from "node-fetch"
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'

export const typesGetIdsResult = t.array(t.number)

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
        let result = await fetch(url, { timeout: this.config.fetchTimeout })
        if (result.ok) {
            let data = await result.json();
            let validator = typesGetIdsResult.decode(data)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        } else {
            throw new Error(`${opId}| api access error: ${result.statusText}`)
        }
    }
}