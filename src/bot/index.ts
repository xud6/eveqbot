import { CQWebSocket, CQWebSocketOption, CQEvent, WebSocketType, CQTag } from "@xud6/cq-websocket";
import { cCEVEMarketApi } from "../api/ceve_market_api/index";
import { startsWith, trim, replace } from "lodash";
import { tLogger } from "tag-tree-logger";
import { modelQQBotMessageLog } from "../models/modelQQBotMessageLog";
import { modelQQBotMessageSource } from "../models/modelQQBotMessageSource";
import { modelEveESIUniverseTypes } from "../models/modelEveESIUniverseTypes";
import { QQBotMessageSource } from "../db/entity/QQBotMessageSource";
import { tCommandBase } from "./command/tCommandBase";
import { commandItem } from "./command/commandItem";
import { commandJita } from "./command/commandJita";
import { commandHelp } from "./command/commandHelp";
import { genMessageInfo, tMessageInfo } from "./qqMessage";
import { tQQBotMessagePacket } from "./types";
import { commandCfg } from "./command/commandCfg";
import { opId } from "../opId";
import { retryHandler } from "../utils/retryHandler";


export interface tCQQBotCfg {
    cqwebConfig: Partial<CQWebSocketOption>
    nonProductionSourceOnly: boolean,
    sendRetryMax: number
}

export interface cQQBotExtService {
    CEVEMarketApi: cCEVEMarketApi
    models: {
        modelQQBotMessageLog: modelQQBotMessageLog
        modelQQBotMessageSource: modelQQBotMessageSource,
        modelEveESIUniverseTypes: modelEveESIUniverseTypes
    }
    opId: opId
}

export type replyHandler = (messageInfo: tMessageInfo, message: string) => Promise<void>

export class cQQBot {
    readonly logger: tLogger
    readonly bot: CQWebSocket
    readonly commands: tCommandBase[]
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly config: tCQQBotCfg,
    ) {
        this.logger = parentLogger.logger(["QQBot"])
        this.bot = new CQWebSocket(config.cqwebConfig);
        this.bot.on('socket.connecting', (wsType: WebSocketType, attempts: number) => {
            this.logger.info(`attemp to connect ${wsType} No.${attempts} started`)
        }).on('socket.connect', (wsType: WebSocketType, sock: any, attempts: number) => {
            this.logger.info(`attemp to connect ${wsType} No.${attempts} success`)
        }).on('socket.failed', (wsType: WebSocketType, attempts: number) => {
            this.logger.info(`attemp to connect ${wsType} No.${attempts} failed`)
        })

        this.bot.on('message', (event: CQEvent, context: Record<string, any>, tags: CQTag[]) => {
            this.messageHandler(event, context, tags)
        })

        this.commands = [];
        this.commands.push(new commandJita(this.logger, this.extService, this))
        this.commands.push(new commandItem(this.logger, this.extService, this))
        this.commands.push(new commandCfg(this.logger, this.extService, this))
        this.commands.push(new commandHelp(this.logger, this.extService, this))
    }
    async startup() {
        this.bot.connect()
    }
    async shutdown(){
        this.bot.disconnect()
    }
    checkStartWith(msg: string, tags: string[]): string | null {
        for (let tag of tags) {
            if (startsWith(msg, tag)) {
                return trim(replace(msg, tag, ''));
            }
        }
        return null
    }
    async checkMessage(message: string): Promise<{ command: tCommandBase, msg: string } | null> {
        for (let command of this.commands) {
            let msg = this.checkStartWith(message, command.commandPrefix)
            if (msg !== null) {
                return {
                    command: command,
                    msg: msg
                };
            }
        }
        return null
    }
    async replyMessage(messageInfo: tMessageInfo, message: string) {
        let opId = this.extService.opId.getId()
        let messageParams: Record<string, any> = {}
        messageParams.message_type = messageInfo.message_type;
        messageParams.group_id = messageInfo.group_id || undefined
        messageParams.discuss_id = messageInfo.discuss_id || undefined
        messageParams.user_id = messageInfo.sender_user_id || undefined
        this.logger.info(`${opId}| reply message to ${JSON.stringify(messageParams)}`)
        messageParams.message = message
        try {
            await retryHandler(async (retryCnt) => {
                if (retryCnt) {
                    this.logger.info(`${opId}| retry ${retryCnt} send message to ${JSON.stringify(messageParams)}`)
                }
                let result = await this.bot("send_msg", messageParams, { timeout: 1000 * 10 })
                this.logger.info(`${opId}| 发送成功 ${JSON.stringify(result)}`)
            }, this.config.sendRetryMax, (e) => { this.logger.error(`${opId}| 发送错误 ${e.message || e}`) })
        } catch (e) {
            this.logger.error(`${opId}| 发送失败 ${e.message || e}`)
        }
    }
    async messageHandler(event: CQEvent, context: Record<string, any>, tags: CQTag[]): Promise<string | void> {
        try {
            let messageInfo = genMessageInfo(event, context, tags);
            let messageSource = await this.extService.models.modelQQBotMessageSource.getQQBotMessageSource(messageInfo)
            if (messageSource) {
                let pHandlerMessage = this.messageProcess(messageSource, messageInfo)
                let pMessageLog = this.extService.models.modelQQBotMessageLog.appendQQBotMessageLog(messageSource, messageInfo, event, context, tags);
                let replyMessage = await pHandlerMessage;
                if (replyMessage) {
                    await this.replyMessage(messageInfo, replyMessage)
                }
                await pMessageLog;
            } else {
                this.logger.error(`Can't read or create source for ${messageInfo}`)
            }
        } catch (e) {
            this.logger.error(`internal error ${e.message || e}`)
            return
        }
    }
    async messageProcess(messageSource: QQBotMessageSource, messageInfo: tMessageInfo): Promise<string | void> {
        let message = messageInfo.message
        if (messageInfo.atMe) {
            message = trim(replace(message, `[CQ:at,qq=${messageInfo.self_id}]`, ''))
        }
        let commandMsg = await this.checkMessage(message);
        if (commandMsg) {
            let messagePacket: tQQBotMessagePacket = {
                atMe: messageInfo.atMe,
                isAdmin: this.extService.models.modelQQBotMessageSource.isAdmin(messageInfo, messageSource),
                message: commandMsg.msg,
                commandName: commandMsg.command.name
            }
            if (messageSource.enable) {
                try {
                    if (this.config.nonProductionSourceOnly) {
                        if (messageSource.production) {
                            this.logger.info(`Ignore Command [${commandMsg.command.name}] with [${commandMsg.msg}] from [${messageSource.id}/${messageSource.source_type}/${messageSource.source_id}/${messageInfo.sender_user_id}] because current server is non-production only`);
                            return
                        }
                    }
                    let res: string | null = null
                    this.logger.info(`Command [${commandMsg.command.name}] with [${commandMsg.msg}] from [${messageSource.id}/${messageSource.source_type}/${messageSource.source_id}/${messageInfo.sender_user_id}]`);
                    res = await commandMsg.command.handler(messageSource, messageInfo, messagePacket)
                    if (res) {
                        return `[CQ:at,qq=${messageInfo.sender_user_id}]\n${res}`
                    }
                } catch (e) {
                    this.logger.error(`command process error ${e}`)
                    return "内部错误"
                }
            } else {
                this.logger.info(`Ignore Command [${commandMsg.command.name}] with [${commandMsg.msg}] from [${messageSource.id}/${messageSource.source_type}/${messageSource.source_id}/${messageInfo.sender_user_id}] because it's not enabled`);
            }
        }
    }
}
