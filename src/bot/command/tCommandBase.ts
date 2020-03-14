import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { tMessageInfo } from "..";

export interface tCommandBase {
    name: string,
    commandPrefix: string[],
    startup: () => Promise<void>,
    shutdown: () => Promise<void>,
    handler: (messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string) => Promise<string | null>
}