import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { CQEvent, CQTag } from "@xud6/cq-websocket";
import { QQBotMessageLog } from "../db/entity/QQBotMessageLog";
import { tMessageInfo } from "../bot";
import { cModels } from ".";

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
    async appendQQBotMessageLog(messageInfo: tMessageInfo, event: CQEvent, context: Record<string, any>, tags: CQTag[]) {
        let repo = await this.extService.db.getRepository(QQBotMessageLog);
        let source = await this.models.modelQQBotMessageSource.getQQBotMessageSource(messageInfo)
        let messageLogEntry = repo.create({
            message: messageInfo.message,
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
        return await repo.save(messageLogEntry)
    }
}
