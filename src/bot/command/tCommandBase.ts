import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { tMessageInfo } from "../qqMessage";
import { tQQBotMessagePacket } from "../types";

export interface tCommandBase {
    name: string,
    helpStr: string,
    commandPrefix: string[],
    adminOnly: boolean,
    startup: () => Promise<void>,
    shutdown: () => Promise<void>,
    handler: (opId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket) => Promise<string | null>
}