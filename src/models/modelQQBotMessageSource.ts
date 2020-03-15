import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { CQEvent, CQTag } from "@xud6/cq-websocket";
import { QQBotMessageSource } from "../db/entity/QQBotMessageSource";
import { cModels } from ".";
import { tMessageInfo } from "../bot/qqMessage";
import { indexOf } from "lodash";
import { eveServer } from "../types";

interface tMessageSourceInfo {
    source_type: string,
    source_id: number
}


export class modelQQBotMessageSource implements tModelBase {
    readonly name = "QQBotMessageLog"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelQQBotMessageSource"])
    }
    async startup() { }
    async shutdown() { }
    async getQQBotMessageSource(messageInfo: tMessageInfo): Promise<QQBotMessageSource | undefined> {
        let messageLogInfo: tMessageSourceInfo | undefined
        if (messageInfo.message_type === "group" && messageInfo.group_id) {
            messageLogInfo = {
                source_type: messageInfo.message_type,
                source_id: messageInfo.group_id
            }
        } else if (messageInfo.message_type === "private") {
            messageLogInfo = {
                source_type: messageInfo.message_type,
                source_id: messageInfo.sender_user_id
            }
        }
        if (messageLogInfo) {
            let repo = await this.extService.db.getRepository(QQBotMessageSource);
            let result = await repo.findOne({
                where: {
                    source_type: messageLogInfo.source_type,
                    source_id: messageLogInfo.source_id
                }
            })
            if (result === undefined) {
                let record = repo.create({
                    source_type: messageLogInfo.source_type,
                    source_id: messageLogInfo.source_id,
                    info: ""
                })
                await repo.save(record)
                return await repo.findOne({
                    where: {
                        source_type: messageLogInfo.source_type,
                        source_id: messageLogInfo.source_id
                    }
                })
            } else {
                return result
            }
        }
    }
    isAdmin(messageInfo: tMessageInfo, messageSource: QQBotMessageSource) {
        return indexOf(messageSource.admins, `${messageInfo.sender_user_id}`) >= 0
    }
    async setInfo(id: number, info: string) {
        let repo = await this.extService.db.getRepository(QQBotMessageSource);
        let source = await repo.findOne({
            id: id
        })
        if (source) {
            source.info = info;
            await repo.save(source)
            return repo.findOne({
                id: id
            })
        } else {
            throw new Error("未找到")
        }
    }
    async setServer(id: number, server: eveServer) {
        let repo = await this.extService.db.getRepository(QQBotMessageSource);
        let source = await repo.findOne({
            id: id
        })
        if (source) {
            source.eve_server = server;
            await repo.save(source)
            return repo.findOne({
                id: id
            })
        } else {
            throw new Error("未找到")
        }
    }
}
