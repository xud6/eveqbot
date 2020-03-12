import { tEveqbotConfig } from "..";

export interface tLogConfig {
    name: string,
    state: boolean
}

export interface tConfig {
    logger: tLogConfig[]
    eveqbot: tEveqbotConfig
}