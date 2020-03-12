import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { CQEvent, CQTag } from "@xud6/cq-websocket";
import { QQBotMessageLog } from "../db/entity/QQBotMessageLog";
import { tMessageInfo } from "../bot";

export class modelQQBotMessageLog implements tModelBase {
    readonly name = "QQBotMessageLog"
    readonly logger: tLogger
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: tModelsExtService,
    ) {
        this.logger = parentLogger.logger(["modelQQBotMessageLog"])
    }
    async startup() { }
    async shutdown() { }
    async appendQQBotMessageLog(messageInfo: tMessageInfo, event: CQEvent, context: Record<string, any>, tags: CQTag[]) {
        let repo = await this.extService.db.getRepository(QQBotMessageLog);

        let messageLogEntry = repo.create({
            message: messageInfo.message,
            message_id: messageInfo.message_id,
            message_type: messageInfo.message_type,
            group_id: messageInfo.group_id,
            sender_user_id: messageInfo.sender_user_id,
            sender_nickname: messageInfo.sender_nickname,
            self_id: messageInfo.self_id,
            atMe: messageInfo.atMe,
            raw_event: event,
            raw_context: context,
            raw_tags: tags
        })
        return await repo.save(messageLogEntry)
    }
}
