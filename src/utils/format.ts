export function numberFormat(num: number, minimumFractionDigits: number = 0) {
    if (num === 0) {
        return '-'
    } else {
        return num.toLocaleString("arab", { minimumFractionDigits: minimumFractionDigits });
    }
}
