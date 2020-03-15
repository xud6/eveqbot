import { tLogger } from "tag-tree-logger"
import { tEveESIExtService, tEveESICfg, tEveESILanguange } from "../types"
import * as t from 'io-ts'
import { isRight } from "fp-ts/lib/Either"
import { PathReporter } from 'io-ts/lib/PathReporter'
import { retryHandler } from "../../../utils/retryHandler"
import got from "got"

export const vSystemsGetIdsResult = t.array(t.Int)

export const vSystemPosition = t.type({
    x: t.number,
    y: t.number,
    z: t.number
})
export interface tSystemPosition extends t.TypeOf<typeof vSystemPosition> { }

export const vSystemPlanetRequired = t.type({
    planet_id: t.Int
})
export const vSystemPlanetOptional = t.partial({
    asteroid_belts: t.array(t.Int),
    moons: t.array(t.Int)
})
export const vSystemPlanet = t.intersection([vSystemPlanetRequired, vSystemPlanetOptional])
export interface tSystemPlanet extends t.TypeOf<typeof vSystemPlanet> { }

export const vSystemsGetByIdResultRequired = t.type({
    constellation_id: t.Int,
    name: t.string,
    position: vSystemPosition,
    security_status: t.number,
    system_id: t.Int
})
export const vSystemsGetByIdResultOptional = t.partial({
    planets: t.array(vSystemPlanet),
    security_class: t.string,
    star_id: t.Int,
    stargates: t.array(t.Int),
    stations: t.array(t.Int)
})
export const vSystemsGetByIdResult = t.intersection([vSystemsGetByIdResultRequired, vSystemsGetByIdResultOptional])
export interface tSystemsGetByIdResult extends t.TypeOf<typeof vSystemsGetByIdResult> { }

export class systems {
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tEveESIExtService,
        readonly config: tEveESICfg
    ) {
        this.logger = parentLogger.logger(["systems"])
    }
    async getIds() {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v1/universe/systems/?datasource=${this.config.datasource}`
        this.logger.log(`${opId}| read universe/systems | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout * 5 }).json()
            let validator = vSystemsGetIdsResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
    async getById(id: number, language: tEveESILanguange) {
        let opId = this.extService.opId.getId()
        let url = `${this.config.esiUrl}/v4/universe/systems/${id}/?datasource=${this.config.datasource}&language=${language}`
        this.logger.log(`${opId}| read universe/systems id[${id}] lang[${language}] | ${url}`)
        return await retryHandler(async () => {
            let result = await got(url, { timeout: this.config.httpTimeout }).json()
            let validator = vSystemsGetByIdResult.decode(result)
            if (isRight(validator)) {
                return validator.right
            } else {
                throw new Error(`${opId}| ${id} api access error result unexpected ${PathReporter.report(validator).toString()}`);
            }
        }, this.config.httpRetry, (e) => { this.logger.warn(e) })
    }
}


