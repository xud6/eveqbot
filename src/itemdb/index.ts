import { loadFromCeveMarketXLS, itemDataType } from './importData'
import { filter, map } from 'lodash';

export class cItemdb {
    readonly itemData: itemDataType[]
    constructor(readonly dataXlsName: string) {
        this.itemData = loadFromCeveMarketXLS(dataXlsName);
    }
    searchByFullName(name: string) {
        console.time('Fullname search complete in ')
        let res = filter(this.itemData, item => {
            if (item.name.indexOf(name) >= 0) {
                return true
            } else {
                return false
            }
        })
        console.time('Fullname search complete in ')
        return res
    }
    searchByWord(name: string) {
        console.time('Word search complete in ')
        let result = this.itemData
        map(name, word => {
            result = filter(result, d => {
                if (d.name.indexOf(word) >= 0) {
                    return true
                } else {
                    return false
                }
            })
        })
        console.time('Word search complete in ')
        return result;
    }
    search(name: string) {
        console.time('search complete in ')
        let res = this.searchByFullName(name);
        if(res.length = 0){
            res = this.searchByWord(name);
        }
        console.timeEnd('search complete in ')
        return res
    }
}

let test = new cItemdb('itemdb.xls');
