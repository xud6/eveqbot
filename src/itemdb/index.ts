import { loadFromCeveMarketXLS,itemDataType } from './importData'
import { filter } from 'lodash';

export class cItemdb {
    readonly itemData:itemDataType[]
    constructor(readonly dataXlsName:string){
        this.itemData = loadFromCeveMarketXLS(dataXlsName);
    }
    searchByFullName(name:string){
        return filter(this.itemData,item=>{
            if(item.name.indexOf(name) >= 0){
                return true
            }else{
                return false
            }
        })
    }
    search(name:string){
        console.time('search complete in ')
        let res = this.searchByFullName(name);
        console.timeEnd('search complete in ')
        return res
    }
}
