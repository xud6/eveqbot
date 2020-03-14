import { CQWebSocket, CQWebSocketOption, CQEvent, WebSocketType, CQTag } from "@xud6/cq-websocket";
import { cCEVEMarketApi } from "../api/ceve_market_api/index";
import { startsWith, trim, replace } from "lodash";
import { tLogger } from "tag-tree-logger";
import { modelQQBotMessageLog } from "../models/modelQQBotMessageLog";
import { modelQQBotMessageSource } from "../models/modelQQBotMessageSource";
import { modelEveESIUniverseTypes } from "../models/modelEveESIUniverseTypes";
import { QQBotMessageSource } from "../db/entity/QQBotMessageSource";
import { tCommandBase } from "./command/tCommandBase";
import { commandAddr } from "./command/commandAddr";
import { commandItem } from "./command/commandItem";
import { commandJita } from "./command/commandJita";
import { commandHelp } from "./command/commandHelp";
import { genMessageInfo, tMessageInfo } from "./qqMessage";

export interface tCQQBotCfg {
    cqwebConfig: Partial<CQWebSocketOption>
    nonProductionSourceOnly: boolean,
}

export interface cQQBotExtService {
    CEVEMarketApi: cCEVEMarketApi
    models: {
        modelQQBotMessageLog: modelQQBotMessageLog
        modelQQBotMessageSource: modelQQBotMessageSource,
        modelEveESIUniverseTypes: modelEveESIUniverseTypes
    }
}

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

        this.bot.on('message', async (event: CQEvent, context: Record<string, any>, tags: CQTag[]): Promise<string | void> => {
            let messageInfo = genMessageInfo(event, context, tags);
            let messageSource = await this.extService.models.modelQQBotMessageSource.getQQBotMessageSource(messageInfo)
            if (messageSource) {
                let pHandlerMessage = this.handlerMessage(messageSource, messageInfo)
                let pMessageLog = this.extService.models.modelQQBotMessageLog.appendQQBotMessageLog(messageSource, messageInfo, event, context, tags);
                let result = await pHandlerMessage;
                await pMessageLog;
                return result
            } else {
                this.logger.error(`Can't read or create source for ${messageInfo}`)
            }
        })

        this.commands = [];
        this.commands.push(new commandAddr(this.logger, this.extService))
        this.commands.push(new commandItem(this.logger, this.extService))
        this.commands.push(new commandJita(this.logger, this.extService))
        this.commands.push(new commandHelp(this.logger, this.extService, this))
    }
    async startup() {
        this.bot.connect()
    }
    checkStartWith(msg: string, tags: string[]): string | null {
        for (let tag of tags) {
            if (startsWith(msg, tag)) {
                return trim(replace(msg, tag, ''));
            }
        }
        return null
    }
    async checkMessage(messageInfo: tMessageInfo): Promise<{ command: tCommandBase, msg: string } | null> {
        for (let command of this.commands) {
            let msg = this.checkStartWith(messageInfo.message, command.commandPrefix)
            if (msg !== null) {
                return {
                    command: command,
                    msg: msg
                };
            }
        }
        return null
    }
    async handlerMessage(messageSource: QQBotMessageSource, messageInfo: tMessageInfo): Promise<string | void> {
        let commandMsg = await this.checkMessage(messageInfo);
        if (commandMsg) {
            if (messageSource.enable) {
                if (this.config.nonProductionSourceOnly) {
                    if (messageSource.production) {
                        this.logger.info(`Ignore Command [${commandMsg.command.name}] with [${commandMsg.msg}] from [${messageSource.id}/${messageSource.source_type}/${messageSource.source_id}/${messageInfo.sender_user_id}] because current server is non-production only`);
                        return
                    }
                }
                let res: string | null = null
                this.logger.info(`Command [${commandMsg.command.name}] with [${commandMsg.msg}] from [${messageSource.id}/${messageSource.source_type}/${messageSource.source_id}/${messageInfo.sender_user_id}]`);
                res = await commandMsg.command.handler(messageSource, messageInfo, commandMsg.msg)
                if (res) {
                    return `[CQ:at,qq=${messageInfo.sender_user_id}]\n${res}`
                }
            } else {
                this.logger.info(`Ignore Command [${commandMsg.command.name}] with [${commandMsg.msg}] from [${messageSource.id}/${messageSource.source_type}/${messageSource.source_id}/${messageInfo.sender_user_id}] because it's not enabled`);
            }
        }
    }
}
