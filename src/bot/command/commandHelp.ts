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
        this.logger = parentLogger.logger(["commandHelp"])
    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string): Promise<string | null> {
        if (message === "cfg") {
            let result = ""
            result = result + `当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`

            if (this.extService.models.modelQQBotMessageSource.isAdmin(messageInfo, messageSource)) {
                result = result + `\nProduction Channel:${messageSource.production}`
                result = result + `\n版本号:${version}`
            }
            return result
        } else {
            let result = ""
            result = result + join(this.QQBot.commands.map((c) => {
                return c.helpStr
            }), "")
            result = result + `当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`
            return result
        }
    }
}