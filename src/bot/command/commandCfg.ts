import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { join, startsWith, replace, trim } from "lodash";
import { eveServerInfo, eveMarketApiInfo } from "../../types";
import packageInfo from "./../../../package.json"
import { tQQBotMessagePacket } from "../types";
let version = packageInfo.version

export class commandCfg implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "cfg"
    readonly helpStr: string = ".cfg 参数设置\n--- setinfo 设置help信息"
    readonly commandPrefix: string[] = ['.cfg', '。cfg']
    readonly adminOnly: boolean = true
    readonly param = {
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService
    ) {
        this.logger = parentLogger.logger(["commandCfg"])
    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        console.log(messagePacket)
        if (messagePacket.atMe && messagePacket.isAdmin) {
            if (startsWith(messagePacket.message, "setinfo")) {
                this.logger.info(`cfg setinfo from ${messageInfo.sender_user_id} in ${messageSource.source_type}/${messageSource.source_id}`)
                let cfgData = trim(replace(messagePacket.message, "setinfo", ''));
                this.logger.info(`${cfgData}`)
                try {
                    let result = await this.extService.models.modelQQBotMessageSource.setInfo(messageSource.id, cfgData);
                    if (result) {
                        return `设置成功，当前info为:\n${result.info}`
                    } else {
                        return `设置失败`
                    }
                } catch (e) {
                    return `设置失败`
                }
            }
            if (startsWith(messagePacket.message, "showadmins")) {

            }
        }
        return null
    }
}