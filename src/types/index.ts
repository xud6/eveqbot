import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { CQWebSocketOption } from "@xud6/cq-websocket";
import { tCQQBotCfg } from "../bot";
import { tCEVEMarketApiCfg } from "../api/ceve_market_api";

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
    dataLoadConcurrency: number
}

export enum eveServer {
    tranquility = 0,
    serenity = 1,
}

export const eveServerInfo = [
    {
        name: "tranquility",
        dispName: "世界服"
    },
    {
        name: "serenity",
        dispName: "国服"
    }
]

export enum eveMarketApi {
    ceveMarket = 0,
    ESITQ = 1,
}

export const eveMarketApiInfo = [
    {
        name: "ceveMarket",
        dispName: "EVE国服市场中心 https://www.ceve-market.org/api/"
    },
    {
        name: "ESITQ",
        dispName: "ESI Tranquility https://esi.evetech.net/"
    }
]