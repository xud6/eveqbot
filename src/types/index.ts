import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { tCQQBotCfg } from "../bot";
import { tCEVEMarketApiCfg } from "../api/ceve_market_api";
import { tModelsConfig } from "../models/types";

export interface tLogConfig {
    name: string,
    state: boolean
}

export interface tDatabaseConfig {
    url?: string,  //     mysql://test:test@localhost/test
    database: string,
    username: string,
    password: string,
    host: string,
    port: number,
    prefix?: string,
    logging: LoggerOptions
}

export interface tServiceCfg {
    QQBot: boolean,
    reloadData: boolean,
}

export interface tConfig {
    logger: tLogConfig[]
    QQBot: tCQQBotCfg
    db: tDatabaseConfig,
    service: tServiceCfg,
    CEVEMarketApi: tCEVEMarketApiCfg
    dataLoadConcurrency: number,
    debugMode: boolean,
    models: tModelsConfig,
    instanceName: string
}

export enum eveServer {
    tranquility = 0,
    serenity = 1,
}

export const eveServerInfo = [
    {
        name: "tranquility",
        dispName: "世界服(Tranquility)"
    },
    {
        name: "serenity",
        dispName: "国服(Serenity)"
    }
]

export enum eveMarketApi {
    ceveMarket = 0,
    ESITQ = 1,
}

export const eveMarketApiInfo = [
    {
        name: "ceveMarket",
        dispName: "EVE国服市场中心 ",
        url: "https://www.ceve-market.org/api/"
    },
    {
        name: "ESITQ",
        dispName: "ESI TQ",
        url: "https://esi.evetech.net/"
    }
]