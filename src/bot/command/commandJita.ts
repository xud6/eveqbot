import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService } from "..";
import { tLogger } from "tag-tree-logger";
import { eveMarketApi, eveServerInfo, eveMarketApiInfo } from "../../types";
import { join } from "lodash";
import { itemNameDisp, formatItemNames } from "../../utils/eveFuncs";
import { tMessageInfo } from "../qqMessage";

export class commandJita implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "jita"
    readonly commandPrefix: string[] = ['.jita', '。jita', '.吉他', '。吉他']
    readonly param = {
        searchContentLimit: 30,
        resultPriceListLimit: 5,
        resultNameListLimit: 50
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
    ) {

    }
    async startup() { }
    async shutdown() { }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, message: string): Promise<string | null> {
        if (message.length > this.param.searchContentLimit) {
            this.logger.info(`search content too long from [${messageInfo.sender_user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.param.searchContentLimit}`
        }

        let items = await this.extService.models.modelEveESIUniverseTypes.MarketSearch(message, this.param.resultNameListLimit + 1)
        if (items.length == 0) {
            this.logger.info(`找不到 ${message}`)
            return '找不到该物品'
        } else if (items.length > 0 && items.length <= this.param.resultPriceListLimit) {
            if (messageSource.eve_marketApi === eveMarketApi.ceveMarket) {
                let head = `共有${items.length}种物品符合该条件 | 当前服务器[${eveServerInfo[messageSource.eve_server].dispName}] | 当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName}\n`
                let marketdata: string[] = await Promise.all(items.map(async item => {
                    let market = await this.extService.CEVEMarketApi.getMarketString(item.id.toString(), messageSource.eve_server)
                    return `${itemNameDisp(item)} --- ${market}`;
                }))
                return `${head}${join(marketdata, "\n")}`;
            } else {
                return "市场API配置错误"
            }
        } else {
            this.logger.info(`搜索结果过多: ${items.length}`)
            if (items.length > this.param.resultNameListLimit) {
                return `共有超过${this.param.resultNameListLimit}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(items)}\n......`
            } else {
                return `共有${items.length}种物品符合该条件，请给出更明确的物品名称\n${formatItemNames(items)}`
            }
        }
    }
}