import { cItemdb } from './itemdb/index';
import { cCEVEMarketApi } from './CEveMarketApi';
import { cQQBot } from './bot';

let cqwebConfig = {
  access_token: "",
  host: "172.81.230.235",
  port: 6700
}

console.log(cqwebConfig)
let itemdb = new cItemdb('itemdb.xls');
let CEVEMarketApi = new cCEVEMarketApi();
let bot = new cQQBot(cqwebConfig, itemdb, CEVEMarketApi);
bot.startup();