import request from 'request'
import { includes } from 'lodash';
import { isString } from 'util';
import { eveServer } from '../../types';

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

export class cCEVEMarketApi {
    readonly urlBase = 'https://www.ceve-market.org'
    readonly urlPathSerenity = '/api'
    readonly urlPathTranquility = '/tqapi'
    async marketRegion(itemId: string, server: eveServer = eveServer.serenity, regionId: string = '10000002'): Promise<apiMarketResponse> {
        console.log(`make get market api call for ${itemId}`);
        console.time(`get market api call for ${itemId} end in `)
        let apiPath = this.urlPathSerenity;
        if (server === eveServer.tranquility) {
            apiPath = this.urlPathTranquility
        }
        const url = `${this.urlBase}${apiPath}/market/region/${regionId}/type/${itemId}.json`
        let res = await new Promise<apiMarketResponse>((resolve, reject) => {
            request.get(url, { json: true }, (error, response, body) => {
                if (error) {
                    console.error('get market api failed:', error);
                    reject(error);
                }
                console.log('get market api  successful! ', JSON.stringify(body));
                if (body.buy && body.sell && body.all) {
                    resolve(body);
                } else {
                    if (includes(body, '502')) {
                        reject('市场中心暂时失联，原因(502)')
                    } else {
                        console.error('市场中心暂时失联，原因(返回格式错误)')
                        console.error(body)
                        reject('市场中心暂时失联，原因(返回格式错误)')
                    }
                }
            })
        })
        console.timeEnd(`get market api call for ${itemId} end in `)
        return res;
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
    async searchName(name: string, server: eveServer = eveServer.serenity): Promise<apiSearchNameResponse[]> {
        let apiPath = this.urlPathSerenity;
        if (server === eveServer.tranquility) {
            apiPath = this.urlPathTranquility
        }
        const url = `${this.urlBase}${apiPath}/searchname`;
        return await new Promise<apiSearchNameResponse[]>((resolve, reject) => {
            request.post(url, { json: true, form: { name: name } }, (error, response, body) => {
                if (error) {
                    console.error('search name failed:', error);
                    reject(error);
                }
                console.log('search name successful! ', JSON.stringify(body));
                resolve(body);
            })
        })
    }
}