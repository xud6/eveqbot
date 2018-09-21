import request from 'request'

interface apiMarketResponse {
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

export class cCEVEMarketApi {
    readonly baseUrl = 'https://www.ceve-market.org/api/'
    async marketRegion(itemId: string,regionId:string='10000002'): Promise<apiMarketResponse> {
        const url = `${this.baseUrl}market/region/${regionId}/type/${itemId}.json`
        return await new Promise<apiMarketResponse>((resolve, reject) => {
            request.get(url, {json:true}, (error, response, body) => {
                if (error) {
                    console.error('get market api failed:', error);
                    reject(error);
                }
                console.log('get market api  successful! ', body);
                resolve(body);
            })
        })
    }
    getMarketString(data:apiMarketResponse){
        return `最高收价:${data.buy.max} / 最低卖价:${data.sell.min} | 总挂单量:(${data.all.volume})`
    }
}
