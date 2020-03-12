import { tModelBase } from "./modelBase";
import { tLogger } from "tag-tree-logger";
import { tModelsExtService } from "./types";
import { CQEvent, CQTag } from "@xud6/cq-websocket";
import { QQBotMessageLog } from "../db/entity/QQBotMessageLog";

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
    async appendQQBotMessageLog(event: CQEvent, context: Record<string, any>, tags: CQTag[]) {
        let repo = await this.extService.db.getRepository(QQBotMessageLog);
        let messageLogEntry = repo.create({
            raw_event: event,
            raw_context: context,
            raw_tags: tags
        })
        return await repo.save(messageLogEntry)
    }
}
