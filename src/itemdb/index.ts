import { loadFromCeveMarketXLS, itemDataType } from './importData'
import { filter, map, words, join } from 'lodash';
import { commonNameTransfer } from './commonName';

export class cItemdb {
    readonly itemData: itemDataType[]
    readonly itemDataSkin: itemDataType[]
    readonly itemDataBlueprint: itemDataType[]
    readonly itemDataUpwell: itemDataType[]
    readonly itemDataNormal: itemDataType[]
    constructor(readonly dataXlsName: string) {
        this.itemData = loadFromCeveMarketXLS(dataXlsName);

        this.itemDataSkin = filter(this.itemData, item => {
            if (item.name.indexOf("涂装") >= 0) {
                return true
            } else {
                return false
            }
        })
        let itemDataNoneSkin = filter(this.itemData, item => {
            if (item.name.indexOf("涂装") >= 0) {
                return false
            } else {
                return true
            }
        })

        this.itemDataBlueprint = filter(itemDataNoneSkin, item => {
            if (item.name.indexOf("蓝图") >= 0) {
                return true
            } else {
                return false
            }
        })
        let itemDataNoneBluepront = filter(itemDataNoneSkin, item => {
            if (item.name.indexOf("蓝图") >= 0) {
                return false
            } else {
                return true
            }
        })

        this.itemDataUpwell = filter(itemDataNoneBluepront, item => {
            if (item.name.indexOf("屹立") >= 0) {
                return true
            } else {
                return false
            }
        })
        this.itemDataNormal = filter(itemDataNoneBluepront, item => {
            if (item.name.indexOf("屹立") >= 0) {
                return false
            } else {
                return true
            }
        })
    }
    searchByExact(name: string, itemData: itemDataType[]): itemDataType[] {
        for (let item of itemData) {
            if (item.name === name) {
                return [item];
            }
        }
        return [];
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
        let eWords = words(name, /(\d+)|(\w+)|[^(?:,& \u000A\u000B\u000C\u000D\u0085\u2028\u2029)]/g);
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
    switchDataSets(name: string): itemDataType[] {
        if (name.indexOf('涂装') >= 0) {
            console.log('itemDataSkin')
            return this.itemDataSkin;
        }
        else if (name.indexOf('蓝图') >= 0) {
            //has blueprint in name
            console.log('itemDataBlueprint')
            return this.itemDataBlueprint;
        } else if (name.indexOf('屹立') >= 0) {
            console.log('itemDataUpwell')
            return this.itemDataUpwell;
        } else {
            console.log('itemDataNormal')
            return this.itemDataNormal;
        }
    }
    search(name: string) {
        console.time('search complete in ')
        let itemData = this.switchDataSets(name)
        let res = this.searchByExact(name, itemData);
        if(res.length == 0){
            res = this.searchByFullName(name, itemData);
        }
        if (res.length == 0) {
            res = this.searchByWord(commonNameTransfer(name), itemData);
        }
        console.timeEnd('search complete in ')
        return res
    }
}
