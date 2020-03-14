import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService } from "..";
import { tLogger } from "tag-tree-logger";
import { tMessageInfo } from "../qqMessage";
import { eveServer } from "../../types";

export class commandLink implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "link"
    readonly helpStr: string = ".link (.地址) 查询常用网址\n"
    readonly commandPrefix: string[] = ['.link', '。link', '.网址', '。网址']
    readonly param = {
        searchContentLimit: 10
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
    ) {

    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string): Promise<string | null> {
        let resultstr = ""
        if (messageSource.links) {
            resultstr = resultstr + messageSource.links
        }

        if (messageSource.eve_server === eveServer.serenity) {
            resultstr = resultstr
                + `KB: https://kb.ceve-market.org/` + '\n'
                + `市场: https://www.ceve-market.org/home/` + `\n`
                + `5度扫描: http://tools.ceve-market.org/` + `\n`
                + `合同货柜: http://tools.ceve-market.org/contract/` + `\n`
                + `旗舰导航: http://eve.sgfans.org/navigator/jumpLayout` + `\n`
        } else if (messageSource.eve_server === eveServer.tranquility) {
            resultstr = resultstr
                + `KB: https://zkillboard.com/` + '\n'
                + `市场: https://www.ceve-market.org/home/` + `\n`
                + `5度扫描: http://tools.ceve-market.org/` + `\n`
                + `合同货柜: http://tools.ceve-market.org/contract/` + `\n`
                + `旗舰导航: http://eve.sgfans.org/navigator/jumpLayout` + `\n`
                + `制造计算: https://eve-industry.org/calc/` + '\n'
        }
        return resultstr
    }
}