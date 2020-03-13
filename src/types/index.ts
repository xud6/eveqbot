import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { CQWebSocketOption } from "@xud6/cq-websocket";
import { tCQQBotCfg } from "../bot";

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
    QQBot: boolean
}

export interface tConfig {
    logger: tLogConfig[]
    QQBot: tCQQBotCfg
    db: tDatabaseConfig,
    service: tServiceCfg,
    dataLoadConcurrency: number
}