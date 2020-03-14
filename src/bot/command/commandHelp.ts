import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { join } from "lodash";
import { eveServerInfo, eveMarketApiInfo } from "../../types";
import packageInfo from "./../../../package.json"
let version = packageInfo.version

export class commandHelp implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "help"
    readonly helpStr: string = ""
    readonly commandPrefix: string[] = ['.help', '。help', '.帮助', '。帮助']
    readonly param = {
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly QQBot: cQQBot
    ) {

    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string): Promise<string | null> {
        if (message == "version") {
            return `版本号:${version}`
        } else if (message === "cfg") {
            return `Production Channel:${messageSource.production}\n当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`
        } else {
            let commandStr = join(this.QQBot.commands.map((c) => {
                return c.helpStr
            }), "")
            let systemInfo = `当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`
            return `${commandStr}\n${systemInfo}`
        }
    }
}