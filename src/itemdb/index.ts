import { loadFromCeveMarketXLS, itemDataType } from './importData'
import { filter, map, words, join } from 'lodash';

export class cItemdb {
    readonly itemData: itemDataType[]
    readonly itemDataBlueprint: itemDataType[]
    readonly itemDataNoneBluepront: itemDataType[]
    constructor(readonly dataXlsName: string) {
        this.itemData = loadFromCeveMarketXLS(dataXlsName);
        this.itemDataBlueprint = filter(this.itemData, item => {
            if (item.name.indexOf("蓝图") >= 0) {
                return true
            } else {
                return false
            }
        })
        this.itemDataNoneBluepront = filter(this.itemData, item => {
            if (item.name.indexOf("蓝图") >= 0) {
                return false
            } else {
                return true
            }
        })
    }
    searchByFullName(name: string, itemData: itemDataType[]) {
        console.time('Fullname search complete in ')
        let res = filter(itemData, item => {
            if (item.name.indexOf(name) >= 0) {
                return true
            } else {
                return false
            }
        })
        console.timeEnd('Fullname search complete in ')
        return res
    }
    searchByWord(name: string, itemData: itemDataType[]) {
        console.time('Word search complete in ')
        let result = itemData
        let eWords = words(name, /(\d+)|(\w+)|[^(?:,& )]/g);
        console.log('word explode result :' + join(eWords, '|'))
        map(eWords, word => {
            result = filter(result, d => {
                if (d.name.indexOf(word) >= 0) {
                    return true
                } else {
                    return false
                }
            })
        })
        console.timeEnd('Word search complete in ')
        return result;
    }
    switchBlueprintData(name: string): itemDataType[] {
        if (name.indexOf('蓝图') >= 0) {
            //has blueprint in name
            return this.itemDataBlueprint;
        }else{
            return this.itemDataNoneBluepront;
        }
    }
    search(name: string) {
        console.time('search complete in ')
        let itemData = this.switchBlueprintData(name)
        let res = this.searchByFullName(name, itemData);
        if (res.length == 0) {
            res = this.searchByWord(name, itemData);
        }
        console.timeEnd('search complete in ')
        return res
    }
    swapCommonName(name: string) {

    }
}
