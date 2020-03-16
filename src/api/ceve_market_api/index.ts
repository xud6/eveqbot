import got from "got"
import { includes } from 'lodash';
import { isString } from 'util';
import { eveServer } from '../../types';
import { tLogger } from "tag-tree-logger";
import { retryHandler } from "../../utils/retryHandler";

export interface apiMarketResponse {
    sell: {
        volume: number,
        max: number,
        min: number
    },
    all: {
        volume: number,
        max: number,
        min: number
    },
    buy: {
        volume: number,
        max: number,
        min: number
    }
}

export interface apiSearchNameResponse {
    typeid: number,
    typename: string
}

function numberFormat(num: number, minimumFractionDigits: number = 0) {
    if (num === 0) {
        return '-'
    } else {
        return num.toLocaleString("arab", { minimumFractionDigits: minimumFractionDigits });
    }
}

export interface tCEVEMarketApiCfg {
    httpTimeout: number,
    httpRetry: number
}

export interface cCEVEMarketApiExtSrv {
    httpClientCache: string | Map<any, any>
}

export class cCEVEMarketApi {
    private readonly logger: tLogger
    readonly urlBase = 'https://www.ceve-market.org'
    readonly urlPathSerenity = '/api'
    readonly urlPathTranquility = '/tqapi'
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cCEVEMarketApiExtSrv,
        readonly config: tCEVEMarketApiCfg
    ) {
        this.logger = parentLogger.logger(["CEVEMarketApi"])
    }
    async marketRegion(opId: number, itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002'): Promise<apiMarketResponse> {
        let apiPath = this.urlPathSerenity;
        if (server === eveServer.tranquility) {
            apiPath = this.urlPathTranquility
        }
        const url = `${this.urlBase}${apiPath}/market/region/${regionId}/type/${itemId}.json`
        this.logger.log(`${opId}| make get market api call for ${itemId} | ${url}`);
        let result: any

        result = await retryHandler(async (retryCnt) => {
            let r = await got(url, { cache: this.extService.httpClientCache }).json();
            return r
        }, this.config.httpRetry, (e) => {
            this.logger.error(`${opId}| http error ${e.message || e}`)
        })
        if (result.buy && result.sell && result.all) {
            return result;
        } else {
            this.logger.warn(`${opId}| unexpected api result ${result}`)
            if (includes(result, '502')) {
                throw new Error("市场中心暂时失联，原因(502)")
            }
            throw new Error("市场中心返回格式错误")
        }
    }
    async getMarketData(opId: number, itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002') {
        try {
            let data = await this.marketRegion(opId, itemId, server, regionId)
            return {
                buyHigh: Number(data.buy.max),
                sellLow: Number(data.sell.min),
                buyAmount: Number(data.buy.volume),
                sellAmount: Number(data.sell.volume)
            }
        } catch (e) {
            this.logger.error(`${opId}| ${e.message || e}`)
            return null
        }
    }
    genMarketStringFromData(data: {
        buyHigh: number,
        sellLow: number,
        buyAmount: number,
        sellAmount: number
    }) {
        let buyHigh = numberFormat(data.buyHigh, 2);
        let sellLow = numberFormat(data.sellLow, 2);
        let buyAmount = numberFormat(data.buyAmount);
        let sellAmount = numberFormat(data.sellAmount);
        return `最低卖价: ${sellLow} / 最高收价: ${buyHigh} | 挂单量: ${sellAmount} / ${buyAmount}`
    }
    async getMarketString(opId: number, itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002'): Promise<string> {
        try {
            let data = await this.marketRegion(opId, itemId, server, regionId)
            let buyHigh = numberFormat(Number(data.buy.max), 2);
            let sellLow = numberFormat(Number(data.sell.min), 2);
            let buyAmount = numberFormat(Number(data.buy.volume));
            let sellAmount = numberFormat(Number(data.sell.volume));
            return `最低卖价: ${sellLow} / 最高收价: ${buyHigh} | 挂单量: ${sellAmount} / ${buyAmount}`
        } catch (e) {
            if (isString(e)) {
                return e;
            } else {
                this.logger.error(`${opId}| ${e.message || e}`)
                return '内部错误'
            }
        }
    }
}