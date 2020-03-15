import got from "got"
import { includes } from 'lodash';
import { isString } from 'util';
import { eveServer } from '../../types';
import { tLogger } from "tag-tree-logger";

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
    httpTimeout: number
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
    async marketRegion(itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002'): Promise<apiMarketResponse> {
        let apiPath = this.urlPathSerenity;
        if (server === eveServer.tranquility) {
            apiPath = this.urlPathTranquility
        }
        const url = `${this.urlBase}${apiPath}/market/region/${regionId}/type/${itemId}.json`
        this.logger.log(`make get market api call for ${itemId} | ${url}`);
        let result: any
        try {
            console.time(`get market api call for ${itemId} end in `)
            result = await got(url, { cache: this.extService.httpClientCache }).json();
            console.timeEnd(`get market api call for ${itemId} end in `)
        } catch (e) {
            this.logger.error(`http error ${e.message || e}`)
            throw new Error("市场中心暂时失联，原因HTTP错误")
        }
        if (result.buy && result.sell && result.all) {
            return result;
        } else {
            this.logger.warn(`unexpected api result ${result}`)
            if (includes(result, '502')) {
                throw new Error("市场中心暂时失联，原因(502)")
            }
            throw new Error("市场中心返回格式错误")
        }
    }
    async getMarketData(itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002') {
        try {
            let data = await this.marketRegion(itemId, server, regionId)
            return {
                buyHigh: Number(data.buy.max),
                sellLow: Number(data.sell.min),
                buyAmount: Number(data.buy.volume),
                sellAmount: Number(data.sell.volume)
            }
        } catch (e) {
            this.logger.error(e)
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
        return `最高收价: ${buyHigh} / 最低卖价: ${sellLow} | 挂单量: ${buyAmount} / ${sellAmount}`
    }
    async getMarketString(itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002'): Promise<string> {
        try {
            let data = await this.marketRegion(itemId, server, regionId)
            let buyHigh = numberFormat(Number(data.buy.max), 2);
            let sellLow = numberFormat(Number(data.sell.min), 2);
            let buyAmount = numberFormat(Number(data.buy.volume));
            let sellAmount = numberFormat(Number(data.sell.volume));
            return `最高收价: ${buyHigh} / 最低卖价: ${sellLow} | 挂单量: ${buyAmount} / ${sellAmount}`
        } catch (e) {
            if (isString(e)) {
                return e;
            } else {
                console.log(e)
                return '内部错误'
            }
        }
    }
}