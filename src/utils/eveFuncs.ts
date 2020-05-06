import { forEach, replace, join, map, ceil } from "lodash";
import { eveESIUniverseTypes } from "../db/entity/eveESIUniverseTypes";
import { tPosition } from "../types";

interface eveCommonNameTableObj {
    o: string,
    t: string
}

const eveCommonNameTable: eveCommonNameTableObj[] = [
    { o: "微曲", t: "微型跃迁推进器" },
    { o: "反跳", t: "跃迁扰断器" },
    { o: "重反", t: "重型跃迁扰断器" },
    { o: "网子", t: "停滞缠绕光束" },
    { o: "跳刀", t: "微型跳跃" },
    { o: "注盾", t: "辅助盾" },
    { o: "注甲", t: "辅助甲" },
    { o: "T2", t: "II" },
    { o: "脑浆", t: "技能注入器" },
    { o: "PLEX", t: "飞行员执照" },
    { o: "全抗", t: "适应" },
    { o: "女装", t: "女式" },
]

export function eveCommonNameTransfer(name: string): string {
    let res = name;
    forEach(eveCommonNameTable, obj => {
        res = replace(res, obj.o, obj.t)
    })
    return res
}

export function eveIsSkins(name: string): boolean {
    if (name.toLowerCase().indexOf("skin") >= 0 || name.indexOf("涂装") >= 0) {
        return true
    } else {
        return false
    }
}

export function eveIsBlueprint(name: string): boolean {
    if (name.toLowerCase().indexOf("blueprint") >= 0 || name.indexOf("蓝图") >= 0) {
        return true
    } else {
        return false
    }
}

export function itemNameDisp(item: eveESIUniverseTypes) {
    return `ID:${item.id} | ${item.name_cn} / ${item.name_en} |${item.group.name_cn}|${item.group.category.name_cn}|`
}

export function itemNameDispShort(item: eveESIUniverseTypes) {
    return `ID:${item.id} | ${item.name_cn} / ${item.name_en}`
}

export function itemNameDispShortCn(item: eveESIUniverseTypes) {
    return `ID:${item.id} | ${item.name_cn}`
}

export function itemsNameListCn(items: eveESIUniverseTypes[], lineLength: number = 120) {
    let resultArray: string[] = []
    let resultArrayStr = ""
    items.forEach((item, index) => {
        let newItem = `ID:🔹${item.id} ${item.name_cn}`
        if (resultArrayStr.length + newItem.length > lineLength) {
            resultArray.push(resultArrayStr);
            resultArrayStr = "";
            resultArrayStr += newItem
        } else {
            resultArrayStr += " | "
            resultArrayStr += newItem
        }
    })
    return join(resultArray, "\n")
}

export function formatItemNames(items: eveESIUniverseTypes[]) {
    let d = 0;
    return join(map(items, item => {
        return itemNameDisp(item)
    }), "\n")
}

const ly = 9460730472580800
export function calcLyReal(p1: tPosition, p2: tPosition) {
    return (Math.hypot((p1.x - p2.x), (p1.y - p2.y), (p1.z - p2.z)) / ly)
}
export function calcLy(p1: tPosition, p2: tPosition) {
    return ceil(calcLyReal(p1, p2), 3)
}