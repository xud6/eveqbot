import { opId } from "../../opId";

export interface tEveESIExtService {
    opId: opId
}

export interface tEveESICfg {
    esiUrl: string,
    datasource: string,
    httpTimeout: number,
    httpRetry: number
}

export type tEveESILanguange = "en-us" | "zh"

export const eveESICfgDefault: tEveESICfg = {
    esiUrl: "https://esi.evetech.net",
    datasource: "tranquility",
    httpTimeout: 1000 * 20,
    httpRetry: 5
}