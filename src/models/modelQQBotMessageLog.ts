import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { CQEvent, CQTag } from "@xud6/cq-websocket";
import { QQBotMessageLog } from "../db/entity/QQBotMessageLog";
import { cModels } from ".";
import { QQBotMessageSource } from "../db/entity/QQBotMessageSource";
import { tMessageInfo } from "../bot/qqMessage";

export class modelQQBotMessageLog implements tModelBase {
    readonly name = "QQBotMessageLog"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
        readonly models: cModels
    ) {
        this.logger = parentLogger.logger(["modelQQBotMessageLog"])
    }
    async startup() { }
    async shutdown() { }
    async appendQQBotMessageLog(source: QQBotMessageSource, messageInfo: tMessageInfo, replyMessage: string, event: CQEvent, context: Record<string, any>, tags: CQTag[]) {
        if (this.models.config.noLog) {
            return
        }
        let repo = await this.extService.db.getRepository(QQBotMessageLog);
        let messageLogEntry = repo.create({
            message: messageInfo.message,
            replyMessage: replyMessage,
            message_id: messageInfo.message_id,
            message_type: messageInfo.message_type,
            group_id: messageInfo.group_id,
            discuss_id: messageInfo.discuss_id,
            atMe: messageInfo.atMe,
            sender_user_id: messageInfo.sender_user_id,
            sender_nickname: messageInfo.sender_nickname,
            sender_card: messageInfo.sender_card,
            sender_area: messageInfo.sender_area,
            sender_level: messageInfo.sender_level,
            sender_role: messageInfo.sender_role,
            sender_title: messageInfo.sender_title,
            self_id: messageInfo.self_id,
            time: messageInfo.time,
            sub_type: messageInfo.sub_type,
            anonymous: messageInfo.anonymous,
            source: source,
            raw_tags: tags
        })
        await repo.save(messageLogEntry)
        return
    }
}
