import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './CEveMarketApi';
import { cQQBot } from './bot';
import { CQWebSocketOption } from 'cq-websocket';

let cqwebConfig:Partial<CQWebSocketOption> = {}
if(process.env.host){
    console.log('read config from env')
    cqwebConfig.host = process.env.host;
    if(process.env.port){
        cqwebConfig.port = parseInt(process.env.port)
    }else{
        cqwebConfig.port = 6700
    }
    if(process.env.access_token){
        cqwebConfig.access_token = process.env.access_token
    }else{
        cqwebConfig.access_token = ''
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