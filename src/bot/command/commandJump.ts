import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { join, startsWith, replace, trim, words, split } from "lodash";
import { eveServerInfo, eveMarketApiInfo, eveServer } from "../../types";
import packageInfo from "./../../../package.json"
import { tQQBotMessagePacket } from "../types";
let version = packageInfo.version

export class commandJump implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "jump"
    readonly helpStr: string = ".jump 参数设置\n"
    readonly commandPrefix: string[] = ['.jump', '。jump']
    readonly adminOnly: boolean = false
    readonly param = {
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly QQBot: cQQBot
    ) {
        this.logger = parentLogger.logger(["commandJump"])
    }
    async startup() { }
    async shutdown() { }
    async handler(opId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        this.logger.info(`${opId}| jump command ${messagePacket.message} from ${messageInfo.sender_user_id} in ${messageSource.source_type}/${messageSource.source_id}`)
        if (messagePacket.message === "") {
            this.logger.info(`${opId}| show`)
            return `.jump`
        } else {
            let msgs = split(messagePacket.message, " ");
            if (msgs.length === 1) {
                let systems = await this.extService.models.modelEveESIUniverseSystems.SearchByWord(msgs[0])
                if (systems[0]) {
                    return `${this.extService.models.modelEveESIUniverseSystems.formatStr(systems[0])}`
                }else{
                    return `找不到该星系`
                }
            }
            this.logger.warn(`${opId}| unable to recognise comand ${msgs}`)
        }
        return "无法识别"
    }
}