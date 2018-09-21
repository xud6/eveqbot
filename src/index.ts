import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './CEveMarketApi';
import { cQQBot } from './bot';
import { CQWebSocketOption } from 'cq-websocket';

let cqwebConfig:Partial<CQWebSocketOption> = require('./../config.json')

console.log(cqwebConfig)
let itemdb = new cItemdb('itemdb.xls');
let CEVEMarketApi = new cCEVEMarketApi();
let bot = new cQQBot(cqwebConfig, itemdb, CEVEMarketApi);
bot.startup();