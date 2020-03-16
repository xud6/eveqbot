let p1 = {
    x: 283058837595262560,
    y: 54363349084519460,
    z: 247701036311485860
}
let p2 = {
    x: 285523434045796400,
    y: 56323713314098810,
    z: 255667746050400320
}
const ly = 9460730472580800
console.log(Math.hypot((p1.x - p2.x), (p1.y - p2.y), (p1.z - p2.z)))
console.log(Math.hypot((p1.x - p2.x), (p1.y - p2.y), (p1.z - p2.z)) / ly)
console.log(((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2) ** 0.5)
console.log((((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2) ** 0.5) / ly)
console.log(Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2))
console.log((Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2)) / ly)
console.log(((p1.x / (10 ** 16) - p2.x / (10 ** 16)) ** 2 + (p1.y / (10 ** 16) - p2.y / (10 ** 16)) ** 2 + (p1.z / (10 ** 16) - p2.z / (10 ** 16)) ** 2) ** 0.5)
