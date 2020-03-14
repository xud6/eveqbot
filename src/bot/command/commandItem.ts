import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService } from "..";
import { tLogger } from "tag-tree-logger";
import { formatItemNames } from "../../utils/eveFuncs";
import { tMessageInfo } from "../qqMessage";

export class commandItem implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "item"
    readonly helpStr: string = ".item (.物品) 查询物品名称\n"
    readonly commandPrefix: string[] = ['.item', '。item', '.物品', '。物品']
    readonly param: {
        searchContentLimit: 30,
        resultNameListLimit: 100
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
    ) {

    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string): Promise<string | null> {
        if (message.length > this.param.searchContentLimit) {
            this.logger.info(`search content too long from [${messageInfo.sender_user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.param.searchContentLimit}`
        }

        let items = await this.extService.models.modelEveESIUniverseTypes.SearchCombined(message, this.param.resultNameListLimit + 1, false)
        if (items.length == 0) {
            this.logger.info(`找不到 ${message}`)
            return '找不到该物品'
        } else {
            if (items.length > this.param.resultNameListLimit) {
                return `共有超过${this.param.resultNameListLimit}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(items)}\n......`
            } else {
                return `共有${items.length}种物品符合该条件\n${formatItemNames(items)}`
            }
        }
    }
}