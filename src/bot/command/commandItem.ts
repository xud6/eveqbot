import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { formatItemNames } from "../../utils/eveFuncs";
import { tMessageInfo } from "../qqMessage";
import { tQQBotMessagePacket } from "../types";
import { startsWith } from "lodash";

export class commandItem implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "item"
    readonly helpStr: string = ".item (.物品) 查询物品名称\n"
    readonly commandPrefix: string[] = ['.item', '。item', '.物品', '。物品']
    readonly adminOnly: boolean = false
    readonly param = {
        searchContentLimit: 30,
        resultNameListLimit: 100
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly QQBot: cQQBot
    ) {
        this.logger = parentLogger.logger(["commandItem"])
    }
    async startup() { }
    async shutdown() { }
    async handler(opId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        let message = messagePacket.message
        if (message.length > this.param.searchContentLimit) {
            this.logger.info(`${opId}| search content too long from [${messageInfo.sender_user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.param.searchContentLimit}`
        }

        if (message.length === 0) {
            return `.item 物品名`
                + `.item group 类型名`
        }

        if (startsWith(messagePacket.message, "group ")) {
            let message = messagePacket.message.slice(5).trim()
            let result = await this.extService.models.modelEveESIUniverseTypes.SearchByGroupNames([message], this.param.resultNameListLimit + 1, true)
            if (result.length == 0) {
                this.logger.info(`${opId}| 找不到 ${message}`)
                return '找不到该物品'
            } else {
                if (result.length > this.param.resultNameListLimit) {
                    return `共有超过${this.param.resultNameListLimit}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(result)}\n......`
                } else {
                    return `共有${result.length}种物品符合该条件\n${formatItemNames(result)}`
                }
            }
        } else {
            let result = await this.extService.models.modelEveESIUniverseTypes.SearchCombined(opId, message, this.param.resultNameListLimit + 1, false)
            if (result.types.length == 0 || result.matchType === null) {
                this.logger.info(`${opId}| 找不到 ${message}`)
                return '找不到该物品'
            } else {
                if (result.types.length > this.param.resultNameListLimit) {
                    return `共有超过${this.param.resultNameListLimit}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(result.types)}\n......`
                } else {
                    return `共有${result.types.length}种物品符合该条件,匹配方式${result.matchType.cn}\n${formatItemNames(result.types)}`
                }
            }
        }
    }
}
