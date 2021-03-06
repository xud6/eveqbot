import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { join, startsWith, replace, trim } from "lodash";
import { eveServerInfo, eveMarketApiInfo, eveServer } from "../../types";
import packageInfo from "./../../../package.json"
import { tQQBotMessagePacket } from "../types";
let version = packageInfo.version

export class commandCfg implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "cfg"
    readonly helpStr: string = ".cfg 参数设置\n"
    readonly commandPrefix: string[] = ['.cfg', '。cfg']
    readonly adminOnly: boolean = false
    readonly param = {
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly QQBot: cQQBot
    ) {
        this.logger = parentLogger.logger(["commandCfg"])
    }
    async startup() { }
    async shutdown() { }
    async handler(opId: number, messageId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        if (messagePacket.atMe && messagePacket.isAdmin) {
            this.logger.info(`${opId}| cfg command from ${messageInfo.sender_user_id} in ${messageSource.source_type}/${messageSource.source_id}`)
            this.logger.info(`${opId}| ${messagePacket.message}`)
            if (messagePacket.message === "") {
                this.logger.info(`${opId}| show`)
                return `当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`
                    + `\n\n当前管理员\n${join(messageSource.admins.map((a) => { return ` - ${a}` }), '\n')}`
                    + `\n\n当前info信息\n${messageSource.info}`
                    + `\n\nsetinfo 设置置顶信息` + `\nsetserver 设置服务器`
                    + `\n\nProduction Channel:${messageSource.production}` + `\n版本号:${version}`
            }
            if (startsWith(messagePacket.message, "setinfo")) {
                this.logger.info(`${opId}| setinfo`)
                let cfgData = trim(replace(messagePacket.message, "setinfo", ''));
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
            if (startsWith(messagePacket.message, "setserver")) {
                this.logger.info(`${opId}| setserver`)
                let cfgData = trim(replace(messagePacket.message, "setserver", ''));
                try {
                    let result
                    if (cfgData.indexOf("世界服") >= 0 || cfgData.indexOf("Tranquility") >= 0 || cfgData.indexOf("tranquility") >= 0) {
                        result = await this.extService.models.modelQQBotMessageSource.setServer(messageSource.id, eveServer.tranquility)
                    } else if (cfgData.indexOf("国服") >= 0 || cfgData.indexOf("Serenity") >= 0 || cfgData.indexOf("serenity") >= 0) {
                        result = await this.extService.models.modelQQBotMessageSource.setServer(messageSource.id, eveServer.serenity)
                    }
                    if (result) {
                        return `设置成功，当前server为:\n${eveServerInfo[result.eve_server].dispName}`
                    } else {
                        return `设置失败`
                    }
                } catch (e) {
                    return `设置失败`
                }
            }
        }
        if (messagePacket.message === "") {
            let result = ""
            result = result + `当前服务器:[${eveServerInfo[messageSource.eve_server].dispName}]\n当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}:${eveMarketApiInfo[messageSource.eve_marketApi].url}`
            if (messagePacket.isAdmin) {
                result = result + `\n@我以使用管理员功能`
            }
            return result
        }
        return null
    }
}