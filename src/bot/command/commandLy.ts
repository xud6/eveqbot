import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { join, startsWith, replace, split, orderBy, round } from "lodash";
import packageInfo from "../../../package.json"
import { tQQBotMessagePacket } from "../types";
import { eveESIUniverseSystems } from "../../db/entity/eveESIUniverseSystems";
import { calcLy, calcLyReal } from "../../utils/eveFuncs";

export class commandLy implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "ly"
    readonly helpStr: string = ".ly 星系测距\n"
    readonly commandPrefix: string[] = ['.ly', '。ly']
    readonly adminOnly: boolean = false
    readonly param = {
        distanceCalcMaxRoutes: 10
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly QQBot: cQQBot
    ) {
        this.logger = parentLogger.logger(["commandLy"])
    }
    async startup() { }
    async shutdown() { }
    async handlerDistant(msgs: string[], opId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null | false> {
        let systems1 = await this.extService.models.modelEveESIUniverseSystems.SearchByWord(msgs[0])
        let systems2 = await this.extService.models.modelEveESIUniverseSystems.SearchByWord(msgs[1])

        if (systems1.length === 0) {
            return `找不到起始星系`
        }
        if (systems2.length === 0) {
            return `找不到目标星系`
        }

        if (systems1.length * systems2.length > this.param.distanceCalcMaxRoutes) {
            return `星系不够明确`
                + `\n起始星系(${systems1.length})\n` + join(systems1.map((system) => { return `ID:${system.id} | ${this.extService.models.modelEveESIUniverseSystems.formatStr(system)}` }), '\n')
                + `\n目的星系(${systems2.length})\n` + join(systems2.map((system) => { return `ID:${system.id} | ${this.extService.models.modelEveESIUniverseSystems.formatStr(system)}` }), '\n')
        }

        let routes: { a: eveESIUniverseSystems, b: eveESIUniverseSystems }[] = []
        for (let system1 of systems1) {
            for (let system2 of systems2) {
                routes.push({
                    a: system1,
                    b: system2
                })
            }
        }
        let distances = orderBy(routes.map((route) => {
            return {
                a: route.a,
                b: route.b,
                distant: calcLy(route.a.position, route.b.position)
            }
        }), ["distant"], "asc")
        return `${join(distances.map((d) => {
            return `${d.distant} ly | ${this.extService.models.modelEveESIUniverseSystems.formatStr(d.a)} ➡️ ${this.extService.models.modelEveESIUniverseSystems.formatStr(d.b)}`
        }), "\n")}\n参考 TT/大航:6(5.4) 小航无畏:7(6.3) 黑影:8(7.2) 跳货:10`
    }
    async handler(opId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        this.logger.info(`${opId}| jump command ${messagePacket.message} from ${messageInfo.sender_user_id} in ${messageSource.source_type}/${messageSource.source_id}`)
        if (messagePacket.message === "") {
            this.logger.info(`${opId}| show`)
            return `1| .ly {星系名} 查询星系`
                + `\n` + `2| .ly {星系1} {星系2}  测量星系间距离`
        } else {
            let msgs = split(messagePacket.message, " ");
            if (msgs.length === 1) {
                let systems = await this.extService.models.modelEveESIUniverseSystems.SearchByWord(msgs[0])
                if (systems[0]) {
                    return `ID:${systems[0].id} | ${this.extService.models.modelEveESIUniverseSystems.formatStr(systems[0])}`
                } else {
                    return `找不到该星系`
                }
            }
            if (msgs.length === 2) {
                let result = await this.handlerDistant(msgs, opId, messageSource, messageInfo, messagePacket)
                if (result !== false) {
                    return result
                }
            }
            this.logger.warn(`${opId}| unable to recognise comand ${msgs} | len ${msgs.length}`)
        }
        return "无法识别"
    }
}