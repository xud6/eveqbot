import XLSX from 'xlsx'
var workbook = XLSX.readFile('itemdb.xls');

export interface itemDataType {
    typeID:string,
    name:string,
    description:string,
    group1:string,
    group2:string,
    group3:string,
    group4:string,
    group5:string,
}

export function loadFromCeveMarketXLS(fileName:string){

    let itemSheet = workbook.Sheets[workbook.SheetNames[0]]

    // Rename column name to EN to ease usage
    itemSheet.B1.v = 'name';
    itemSheet.B1.w = 'name';
    itemSheet.C1.v = 'description';
    itemSheet.C1.w = 'description';
    itemSheet.D1.v = 'group1';
    itemSheet.D1.w = 'group1';
    itemSheet.E1.v = 'group2';
    itemSheet.E1.w = 'group2';
    itemSheet.F1.v = 'group3';
    itemSheet.F1.w = 'group3';
    itemSheet.G1.v = 'group4';
    itemSheet.G1.w = 'group4';
    itemSheet.H1.v = 'group5';
    itemSheet.H1.w = 'group5';
    
    return XLSX.utils.sheet_to_json<itemDataType>(itemSheet);
}