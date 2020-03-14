import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { tMessageInfo, cQQBotExtService } from "..";
import { tLogger } from "tag-tree-logger";

export class commandHelp implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "help"
    readonly commandPrefix: string[] = ['.help', '。help', '.帮助', '。帮助']
    readonly param = {
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
    ) {

    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string): Promise<string | null> {
        if (message.length == 0) {
            return ".jita (.吉他) 查询市场信息\n"
                + ".addr (.地址) 查询常用网址 [出勤积分|KB|旗舰导航|市场|5度|合同分析]\n"
        } else if (message == "version") {
            let pkg: any = require('./../../package.json')
            return `版本号:${pkg.version}`
        } else {
            return null
        }
    }
}