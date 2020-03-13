import { without, words, uniq } from "lodash";

let str = "Small Focused Pulse Laser II 小型聚焦脉冲激光器 II Small Focused Beam Laser II 小型聚焦集束激光器 II"
let result = uniq(without(words(str, /(\d+)|(\w+)|[^(?:,&\u000A\u000B\u000C\u000D\u0085\u2028\u2029)]/g), ' '))
console.log(result)