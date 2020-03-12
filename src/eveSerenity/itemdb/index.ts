import { loadFromCEveMarketXLS } from './importData'
import { filter, map, words, join, compact, without } from 'lodash';
import { commonNameTransfer } from './commonName';

export interface tItemData {
    itemId: number,
    name: string,
    searchData: string,
    groups: string[]
}

export class cItemdb {
    readonly itemData: tItemData[]
    readonly itemDataSkin: tItemData[]
    readonly itemDataBlueprint: tItemData[]
    readonly itemDataUpwell: tItemData[]
    readonly itemDataNormal: tItemData[]
    constructor(readonly dataXlsName: string) {
        let rawData = loadFromCEveMarketXLS(dataXlsName);

        this.itemData = rawData.map(data => {
            return {
                itemId: parseInt(data.typeID),
                name: data.name,
                searchData: data.name.toUpperCase(),
                groups: compact([data.group1, data.group2, data.group3, data.group4, data.group5])
            }
        });
        console.log(`imported ${this.itemData.length} items`)
        this.itemDataSkin = filter(this.itemData, item => {
            if (item.searchData.includes("涂装")) {
                return true
            } else {
                return false
            }
        })
        let itemDataNoneSkin = filter(this.itemData, item => {
            if (item.searchData.includes("涂装")) {
                return false
            } else {
                return true
            }
        })

        this.itemDataBlueprint = filter(itemDataNoneSkin, item => {
            if (item.searchData.includes("蓝图")) {
                return true
            } else {
                return false
            }
        })
        let itemDataNoneBluepront = filter(itemDataNoneSkin, item => {
            if (item.searchData.includes("蓝图")) {
                return false
            } else {
                return true
            }
        })

        this.itemDataUpwell = filter(itemDataNoneBluepront, item => {
            if (item.searchData.includes("屹立")) {
                return true
            } else {
                return false
            }
        })
        this.itemDataNormal = filter(itemDataNoneBluepront, item => {
            if (item.searchData.includes("屹立")) {
                return false
            } else {
                return true
            }
        })
    }
    searchByExact(searchQuery: string, itemData: tItemData[]): tItemData[] {
        for (let item of itemData) {
            if (item.searchData === searchQuery) {
                return [item];
            }
        }
        return [];
    }
    searchByFullName(searchQuery: string, itemData: tItemData[]) {
        console.time('Fullname search complete in ')
        let res = filter(itemData, item => {
            if (item.searchData.includes(searchQuery)) {
                return true
            } else {
                return false
            }
        })
        console.timeEnd('Fullname search complete in ')
        return res
    }
    searchByWord(searchQuery: string, itemData: tItemData[]) {
        console.time('Word search complete in ')
        let result = itemData
        let eWords = without(words(searchQuery, /(\d+)|(\w+)|[^(?:,&\u000A\u000B\u000C\u000D\u0085\u2028\u2029)]/g), ' ');
        console.log('word explode result :' + join(eWords, '|'))
        map(eWords, word => {
            result = filter(result, d => {
                if (d.searchData.includes(word)) {
                    return true
                } else {
                    return false
                }
            })
        })
        console.timeEnd('Word search complete in ')
        return result;
    }
    switchDataSets(searchQuery: string): tItemData[] {
        if (searchQuery.includes('涂装')) {
            console.log('itemDataSkin')
            return this.itemDataSkin;
        }
        else if (searchQuery.includes('蓝图')) {
            //has blueprint in name
            console.log('itemDataBlueprint')
            return this.itemDataBlueprint;
        } else if (searchQuery.includes('屹立')) {
            console.log('itemDataUpwell')
            return this.itemDataUpwell;
        } else {
            console.log('itemDataNormal')
            return this.itemDataNormal;
        }
    }
    search(name: string) {
        console.time('search complete in ')
        let searchQuery = name.toUpperCase();
        let itemData = this.switchDataSets(searchQuery)
        let res = this.searchByExact(searchQuery, itemData);
        if (res.length == 0) {
            res = this.searchByFullName(searchQuery, itemData);
        }
        if (res.length == 0) {
            res = this.searchByWord(commonNameTransfer(searchQuery), itemData);
        }
        console.timeEnd('search complete in ')
        return res
    }
}
