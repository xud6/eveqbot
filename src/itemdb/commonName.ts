import { forEach, replace } from "lodash";

interface commonNameTableObj {
    o: string,
    t: string
}

const commonNameTable: commonNameTableObj[] = [
    { o: "微曲", t: "微型跃迁推进器" },
    { o: "反跳", t: "跃迁扰断器" },
    { o: "重反", t: "重型跃迁扰断器" },
    { o: "网子", t: "停滞缠绕光束" },
    { o: "跳刀", t: "微型跳跃" },
    { o: "T2", t: "II" },
    { o: "脑浆", t: "技能注入器" },
    { o: "PLEX", t: "飞行员执照" },
    { o: "全抗", t: "适应" },
]

export function commonNameTransfer(name: string): string {
    let res = name;
    forEach(commonNameTable, obj => {
        res = replace(res, obj.o, obj.t)
    })
    if (res !== name) {
        console.log(`CommonName processed from [${name}] to [${res}]`)
    }
    return res
}