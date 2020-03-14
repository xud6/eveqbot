import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";

export class commandAddr implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "addr"
    readonly commandPrefix: string[] = ['.addr', '。addr', '.地址', '。地址']
    readonly param: {
        searchContentLimit: 10
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
        if (message.includes('出勤') || message.includes('积分')) {
            return `https://eve.okzai.net/jfcx`
        } else if (message.includes('kb') || message.includes('KB')) {
            return `https://kb.ceve-market.org/`
        } else if (message.includes('导航') || message.includes('旗舰')) {
            return `http://eve.sgfans.org/navigator/jumpLayout`
        } else if (message.includes('合同') || message.includes('货柜')) {
            return `http://tools.ceve-market.org/contract/`
        } else if (message.includes('扫描') || message.includes('5度')) {
            return `http://tools.ceve-market.org/`
        } else if (message.includes('市场')) {
            return `https://www.ceve-market.org/home/`
        } else {
            return `我理解不了`
        }
    }
}