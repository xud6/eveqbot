import XLSX = require('xlsx')
var workbook = XLSX.readFile('itemdb.xls');

let itemSheet = workbook.Sheets[workbook.SheetNames[0]]

export const itemData = XLSX.utils.sheet_to_json(itemSheet);

