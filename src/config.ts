const parentConfig = `${process.cwd()}/../servicecfg.json`
const appConfig = `${process.cwd()}/servicecfg.json`

import { tConfig } from './types'
import copyOver from './utils/copyOver'

let config: tConfig = {
    logger: [],
    QQBot: {
        cqwebConfig: {
            host: "127.0.0.1",
            port: 6700,
            accessToken: ""
        },
        nonProductionSourceOnly: false
    },
    db: {
        database: 'dev_eveqbot',
        username: 'dev',
        password: 'dev',
        host: 'localhost',
        port: 3306,
        logging: ["error", "schema", "warn", "info", "log"]
    },
    service: {
        QQBot: true,
        reloadData: true
    },
    dataLoadConcurrency: 5
}

try {
    copyOver(config, require(parentConfig));
    console.log('use parent config')
} catch (e) {
    try {
        copyOver(config, require(appConfig));
        console.log('use app config')
    } catch (e) {
        console.log('use default config')
    }
}

if (process.env.COOLQ_HOST && (process.env.COOLQ_HOST.length > 0)) {
    config.QQBot.cqwebConfig.host = process.env.COOLQ_HOST;
    console.log(`read COOLQ_HOST from env`);
}

if (process.env.COOLQ_PORT && (process.env.COOLQ_PORT.length > 0)) {
    try {
        let COOLQ_PORT = parseInt(process.env.COOLQ_PORT);
        if (COOLQ_PORT > 0) {
            config.QQBot.cqwebConfig.port = COOLQ_PORT
            console.log(`read COOLQ_PORT from env`);
        }
    } catch (e) {
    }
}

if (process.env.COOLQ_ACCESS_TOKEN && (process.env.COOLQ_ACCESS_TOKEN.length > 0)) {
    config.QQBot.cqwebConfig.accessToken = process.env.COOLQ_ACCESS_TOKEN;
    console.log(`read COOLQ_ACCESS_TOKEN from env`);
}

if (process.env.DB_URL && (process.env.DB_URL.length > 0)) {
    config.db.url = process.env.DB_URL;
    console.log(`read DB_URL from env`);
}

if (process.env.DATA_LOAD_CONCURRENT && (process.env.DATA_LOAD_CONCURRENT.length > 0)) {
    try {
        let DATA_LOAD_CONCURRENT = parseInt(process.env.DATA_LOAD_CONCURRENT);
        if (DATA_LOAD_CONCURRENT > 0) {
            config.dataLoadConcurrency = DATA_LOAD_CONCURRENT
            console.log(`read DATA_LOAD_CONCURRENT from env`);
        }
    } catch (e) {
    }
}

export default config;