import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { tMessageInfo } from "../qqMessage";

export interface tCommandBase {
    name: string,
    helpStr: string,
    commandPrefix: string[],
    startup: () => Promise<void>,
    shutdown: () => Promise<void>,
    handler: (messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string) => Promise<string | null>
}