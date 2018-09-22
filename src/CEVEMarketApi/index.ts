import request from 'request'

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

export class cCEVEMarketApi {
    readonly baseUrl = 'https://www.ceve-market.org/api/'
    async marketRegion(itemId: string, regionId: string = '10000002'): Promise<apiMarketResponse> {
        console.log(`make get market api call for ${itemId}`);
        console.time(`get market api call for ${itemId} end in `)
        const url = `${this.baseUrl}market/region/${regionId}/type/${itemId}.json`
        let res = await new Promise<apiMarketResponse>((resolve, reject) => {
            request.get(url, { json: true }, (error, response, body) => {
                if (error) {
                    console.error('get market api failed:', error);
                    reject(error);
                }
                console.log('get market api  successful! ', JSON.stringify(body));
                resolve(body);
            })
        })
        console.timeEnd(`get market api call for ${itemId} end in `)
        return res;
    }
    getMarketString(data: apiMarketResponse) {
        let buyHigh = Number(data.buy.max).toLocaleString();
        let sellLow = Number(data.sell.min).toLocaleString();
        let amount = Number(data.all.volume).toLocaleString();
        return `最高收价: ${buyHigh} / 最低卖价: ${sellLow} | 总挂单量: ${amount}`
    }
    async searchName(name: string): Promise<apiSearchNameResponse[]> {
        const url = `${this.baseUrl}searchname`;
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