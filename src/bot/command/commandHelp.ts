import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { join } from "lodash";
import { eveServerInfo, eveMarketApiInfo, eveServer } from "../../types";
import packageInfo from "./../../../package.json"
import { tQQBotMessagePacket } from "../types";
let version = packageInfo.version

export class commandHelp implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "help"
    readonly helpStr: string = ""
    readonly commandPrefix: string[] = ['.help', '。help', '.帮助', '。帮助']
    readonly adminOnly: boolean = false
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
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        let message = messagePacket.message
        let result = ""
        result = result + join(this.QQBot.commands.map((c) => {
            if (c.adminOnly) {
                if (messagePacket.isAdmin && messagePacket.atMe) {
                    return c.helpStr
                } else {
                    return ""
                }
            }
            return c.helpStr
        }), "")

        if (messageSource.info) {
            result = result + "---置顶信息---\n"
            result = result + messageSource.info
            result = result + "\n"
        }

        if (messageSource.eve_server === eveServer.serenity) {
            result = result + "------------\n"
            result = result
                + `KB: https://kb.ceve-market.org/` + '\n'
                + `市场: https://www.ceve-market.org/home/` + `\n`
                + `5度扫描: http://tools.ceve-market.org/` + `\n`
                + `合同货柜: http://tools.ceve-market.org/contract/` + `\n`
                + `旗舰导航: http://eve.sgfans.org/navigator/jumpLayout` + `\n`
        } else if (messageSource.eve_server === eveServer.tranquility) {
            result = result + "-----------\n"
            result = result
                + `KB: https://zkillboard.com/` + '\n'
                + `市场: https://www.ceve-market.org/home/` + `\n`
                + `5度扫描: http://tools.ceve-market.org/` + `\n`
                + `合同货柜: http://tools.ceve-market.org/contract/` + `\n`
                + `旗舰导航: http://eve.sgfans.org/navigator/jumpLayout` + `\n`
                + `制造计算: https://eve-industry.org/calc/` + '\n'
        }
        result = result + `当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`
        return result
    }
}