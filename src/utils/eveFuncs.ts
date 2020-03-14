import { forEach, replace } from "lodash";

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