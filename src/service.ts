import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './ceve_market_api/index';
import { cQQBot } from './bot/index';
import { CQWebSocketOption } from '@xud6/cq-websocket';

let cqwebConfig:Partial<CQWebSocketOption> = {}
if(process.env.coolq_host){
    console.log('read config from env')
    cqwebConfig.host = process.env.coolq_host;
    if(process.env.coolq_port){
        cqwebConfig.port = parseInt(process.env.coolq_port)
    }else{
        cqwebConfig.port = 6700
    }
    if(process.env.coolq_access_token){
        cqwebConfig.accessToken = process.env.coolq_access_token
    }else{
        cqwebConfig.accessToken = ''
    }
}else{
    console.log('read config from config.json')
    cqwebConfig = require('./../config.json')
}

console.log(cqwebConfig)
let itemdb = new cItemdb('itemdb.xls');
let CEVEMarketApi = new cCEVEMarketApi();
let bot = new cQQBot(cqwebConfig, itemdb, CEVEMarketApi);
bot.startup();