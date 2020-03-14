import { opId } from "../../opId";

export interface tEveESIExtService {
    opId: opId
}

export interface tEveESICfg {
    esiUrl: string,
    datasource: string,
    fetchTimeout: number,
    fetchRetry: number
}

export type tEveESILanguange = "en-us" | "zh"

export const eveESICfgDefault: tEveESICfg = {
    esiUrl: "https://esi.evetech.net",
    datasource: "tranquility",
    fetchTimeout: 1000 * 20,
    fetchRetry: 5
}