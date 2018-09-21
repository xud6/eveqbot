import { loadFromCeveMarketXLS,itemDataType } from './importData'
import { filter } from 'lodash';

export class itemdb {
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
        return this.searchByFullName(name);
    }
}
