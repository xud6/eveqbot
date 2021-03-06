import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { eveMarketApi, eveServerInfo, eveMarketApiInfo, eveServer } from "../../types";
import { join, startsWith, compact, trimEnd, replace, trim, orderBy } from "lodash";
import { itemNameDisp, formatItemNames, itemNameDispShort, itemNameDispShortCn, itemsNameListCn } from "../../utils/eveFuncs";
import { tMessageInfo } from "../qqMessage";
import { tQQBotMessagePacket } from "../types";
import { numberFormat } from "../../utils/format";
import { performance } from "../../utils/performance";

const EVEFitHeadRegexp = /^&#91;(.+),( .+)&#93;$/
const EVEFitItemWithAmountLineRegexp = /^(.+) x(\d+)$/
const EVEContractLineRegexp = /^(.+)\t(\d+)\t(.+)\t(.+)$/

export interface itemList {
    id: number,
    marketAble: boolean,
    quantity: number
}

export class commandJita implements tCommandBase {
    readonly logger: tLogger
    readonly name: string = "jita"
    readonly helpStr: string = ".jita (.吉他) 查询市场信息\n"
    readonly commandPrefix: string[] = ['.jita', '。jita', '.吉他', '。吉他']
    readonly adminOnly: boolean = false
    readonly param = {
        searchContentLimit: 30,
        resultPriceListLimit: 6,
        resultPriceListLimitExtended: 50,
        resultNameListLimit: 25,
        resultNameListLimitExtended: 100,
    }
    constructor(
        readonly parentLogger: tLogger,
        readonly extService: cQQBotExtService,
        readonly QQBot: cQQBot
    ) {
        this.logger = parentLogger.logger(["commandJita"])
    }
    async startup() { }
    async shutdown() { }
    async handlerSingleItem(opId: number, messageId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let message = messageLines[0]
        if (message.length > this.param.searchContentLimit) {
            this.logger.info(`${opId}| search content too long from [${messageInfo.sender_user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.param.searchContentLimit}`
        }
        let resultPriceListLimit = this.param.resultPriceListLimit
        let resultNameListLimit = this.param.resultNameListLimit
        let eve_server: eveServer = messageSource.eve_server
        let eve_marketApi: eveMarketApi = messageSource.eve_marketApi
        let isExtendedMode = false
        if (startsWith(message, `tq `) || startsWith(message, `TQ `)) {
            message = trim(message.slice(2))
            eve_server = eveServer.tranquility
        }
        if (startsWith(message, "ext ") || startsWith(message, "EXT ")) {
            this.logger.info(`${opId}| extended mode`)
            message = trim(message.slice(3))
            resultPriceListLimit = this.param.resultPriceListLimitExtended
            resultNameListLimit = this.param.resultNameListLimitExtended
            isExtendedMode = true
        }
        perfUtil.reset()
        let result = await this.extService.models.modelEveESIUniverseTypes.MarketSearch(opId, message, resultNameListLimit + 1)
        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish market search ${message}`)
        if (result.types.length == 0 || result.matchType === null) {
            this.logger.info(`${opId}| 找不到 ${message}`)
            return '找不到该物品'
        } else if (result.types.length > 0 && result.types.length <= resultPriceListLimit) {
            if (isExtendedMode && result.types.length > this.param.resultPriceListLimit) {
                this.QQBot.replyMessage(opId, messageInfo, `M${messageId} | 共有 ${result.types.length}项条目，查询API中`)
            }
            if (eve_marketApi === eveMarketApi.ceveMarket) {
                let head = `M${messageId} | 共有${result.types.length}种物品符合该条件, 匹配方式${result.matchType.cn}, 耗时${perf.timePastStrMS()}, ${eveServerInfo[eve_server].dispName}市场价格:\n`
                perfUtil.reset()
                let marketdata: string[] = await Promise.all(result.types.map(async item => {
                    let market = await this.extService.CEVEMarketApi.getMarketString(opId, item.id.toString(), eve_server)
                    if (eve_server == eveServer.serenity) {
                        return `🔹${itemNameDispShortCn(item)} | ${market}`;
                    } else {
                        return `🔹${itemNameDisp(item)}\n ${market}`;
                    }
                }))
                this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api data`)
                return `${head}${join(marketdata, "\n")}`;
            } else {
                return "市场API配置错误"
            }
        } else {
            this.logger.info(`${opId}| 搜索结果过多: ${result.types.length}, 需少于${resultPriceListLimit}个`)
            if (result.types.length > resultNameListLimit) {
                return `共有超过${resultNameListLimit}种物品符合符合该条件，请给出更明确的物品名称\n${itemsNameListCn(result.types)}\n......`
            } else {
                return `共有${result.types.length}种物品符合符合该条件，请给出更明确的物品名称\n${itemsNameListCn(result.types)}`
            }
        }
    }
    async handlerEveFit(opId: number, messageId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let EVEFitHead = messageLines[0].match(EVEFitHeadRegexp)
        if (EVEFitHead) {
            let ship = EVEFitHead[1];
            this.logger.info(`${opId}| EVE Fit Mode for ship ${ship}`)
            messageLines[0] = ship
            let inputItems = compact(messageLines).map((line) => {
                let reg = line.match(EVEFitItemWithAmountLineRegexp)
                if (reg) {
                    return {
                        name: reg[1],
                        amount: parseInt(reg[2]) || 1
                    }
                } else {
                    return {
                        name: line,
                        amount: 1
                    }
                }
            })
            this.QQBot.replyMessage(opId, messageInfo, `M${messageId} | EVE Fit 共有 ${inputItems.length}项条目，查询API中`)
            // this.logger.info(items)
            let resultLineData = [];
            let resultSumSellLow = 0;
            let resultSumBuyHigh = 0;
            let resultNotMarketAble = []
            let resultTypeError = []
            let resultMarketError = []
            for (let inputItem of inputItems) {
                perfUtil.reset()
                let type = (await this.extService.models.modelEveESIUniverseTypes.searchByExactName(inputItem.name))[0]
                this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish search item of [${inputItem.name}]`)
                if (type) {
                    if (type.market_group_id !== null) {
                        perfUtil.reset()
                        let marketData = await this.extService.CEVEMarketApi.getMarketData(opId, type.id.toString(), messageSource.eve_server)
                        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api of [${inputItem.name}]`)
                        if (marketData) {
                            resultSumSellLow += marketData.sellLow * inputItem.amount;
                            resultSumBuyHigh += marketData.buyHigh * inputItem.amount;
                            resultLineData.push({
                                amount: inputItem.amount,
                                itemType: type,
                                buyHighTotal: marketData.buyHigh * inputItem.amount,
                                sellLowTotal: marketData.sellLow * inputItem.amount,
                                buyAmount: marketData.buyAmount,
                                sellAmount: marketData.sellAmount
                            })
                        } else {
                            resultMarketError.push(`${itemNameDisp(type)}`)
                        }
                    } else {
                        resultNotMarketAble.push(`${itemNameDisp(type)}`)
                    }
                } else {
                    resultTypeError.push(inputItem.name)
                }
            }
            let resultStr = `M${messageId} | `
            resultStr += `EVE FIT总计${inputItems.length}种物品\n`
            if (resultTypeError.length) {
                resultStr += `不可识别物品${resultTypeError.length}种\n`
                resultStr += join(resultTypeError, '\n') + '\n'
            }
            if (resultMarketError.length) {
                resultStr += `市场访问错误${resultMarketError.length}种\n`
                resultStr += join(resultMarketError, '\n') + '\n'
            }
            if (resultNotMarketAble.length) {
                resultStr += `不可市场交易物品${resultNotMarketAble.length}种\n`
                resultStr += join(resultNotMarketAble, '\n') + '\n'
            }
            if (resultLineData.length) {
                resultStr += `可交易物品${resultLineData.length}种, 耗时${perf.timePastStrMS()}, ${eveServerInfo[messageSource.eve_server].dispName}市场价格:\n`
                resultStr += `最低卖价总计 ${numberFormat(resultSumSellLow, 2)} ,最高收价总计 ${numberFormat(resultSumBuyHigh, 2)}\n`
                resultLineData = orderBy(resultLineData, "sellLowTotal", "desc")
                resultStr += join(resultLineData.map((lineData) => {
                    return `🔹${lineData.amount} x ${itemNameDispShort(lineData.itemType)}\n 最低卖价: ${numberFormat(lineData.sellLowTotal, 2)} / 最高收价: ${numberFormat(lineData.buyHighTotal, 2)} | 挂单量 ${lineData.sellAmount} / ${lineData.buyAmount}`
                }), '\n') + '\n'
            }
            this.logger.info(`${opId}| finish handler evefit in ${perf.timePastStr()}`)
            return resultStr
        } else {
            return false
        }
    }
    async handlerContract(opId: number, messageId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let EVEContractLine = messageLines[0].match(EVEContractLineRegexp)
        if (EVEContractLine) {
            let inputItems: { name: string, amount: number }[] = []
            let UnknowLines: string[] = []
            let resultLineData = [];
            let resultSumSellLow = 0;
            let resultSumBuyHigh = 0;
            let resultNotMarketAble = []
            let resultTypeError = []
            let resultMarketError = []
            messageLines.forEach((line) => {
                let regexp = line.match(EVEContractLineRegexp)
                if (regexp) {
                    let name = regexp[1].trim()
                    let amount = parseInt(regexp[2])
                    if (name.length > 0 && amount > 0) {
                        inputItems.push({
                            name: name,
                            amount: amount
                        })
                    } else {
                        UnknowLines.push(line)
                    }
                } else {
                    UnknowLines.push(line)
                }
            })
            this.QQBot.replyMessage(opId, messageInfo, `M${messageId} | 共有 ${inputItems.length}项条目，查询API中`)
            for (let inputItem of inputItems) {
                perfUtil.reset()
                let type = (await this.extService.models.modelEveESIUniverseTypes.searchByExactName(inputItem.name))[0]
                this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish search item [${inputItem.name}]`)
                if (type) {
                    if (type.market_group_id !== null) {
                        perfUtil.reset()
                        let marketData = await this.extService.CEVEMarketApi.getMarketData(opId, type.id.toString(), messageSource.eve_server)
                        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api [${inputItem.name}]`)
                        if (marketData) {
                            resultSumSellLow += marketData.sellLow * inputItem.amount;
                            resultSumBuyHigh += marketData.buyHigh * inputItem.amount;
                            resultLineData.push({
                                amount: inputItem.amount,
                                itemType: type,
                                buyHighTotal: marketData.buyHigh * inputItem.amount,
                                sellLowTotal: marketData.sellLow * inputItem.amount,
                                buyAmount: marketData.buyAmount,
                                sellAmount: marketData.sellAmount
                            })
                        } else {
                            resultMarketError.push(`${itemNameDisp(type)}`)
                        }
                    } else {
                        resultNotMarketAble.push(`${itemNameDisp(type)}`)
                    }
                } else {
                    resultTypeError.push(inputItem.name)
                }
            }

            let resultStr = `M${messageId} | `
            resultStr += `总计${inputItems.length}种物品\n`
            if (UnknowLines.length) {
                resultStr += `不可识别行${UnknowLines.length}行\n`
                resultStr += join(UnknowLines, '\n') + '\n'
            }
            if (resultTypeError.length) {
                resultStr += `不可识别物品${resultTypeError.length}种\n`
                resultStr += join(resultTypeError, '\n') + '\n'
            }
            if (resultMarketError.length) {
                resultStr += `市场访问错误${resultMarketError.length}种\n`
                resultStr += join(resultMarketError, '\n') + '\n'
            }
            if (resultNotMarketAble.length) {
                resultStr += `不可市场交易物品${resultNotMarketAble.length}种\n`
                resultStr += join(resultNotMarketAble, '\n') + '\n'
            }
            if (resultLineData.length) {
                resultStr += `可交易物品${resultLineData.length}种, 耗时${perf.timePastStrMS()}, ${eveServerInfo[messageSource.eve_server].dispName}市场价格:\n`
                resultStr += `最高收价总计 ${numberFormat(resultSumBuyHigh, 2)} ,最低卖价总计 ${numberFormat(resultSumSellLow, 2)}\n`
                resultLineData = orderBy(resultLineData, "sellLowTotal", "desc")
                resultStr += join(resultLineData.map((lineData) => {
                    return `🔹${lineData.amount} x ${itemNameDispShort(lineData.itemType)}\n 最低卖价: ${numberFormat(lineData.sellLowTotal, 2)} / 最高收价: ${numberFormat(lineData.buyHighTotal, 2)} | 挂单量 ${lineData.sellAmount} / ${lineData.buyAmount}`
                }), '\n') + '\n'
            }
            this.logger.info(`${opId}| finish handler contract ${perf.timePastStr()}`)
            return resultStr
        } else {
            return false
        }
    }
    async handlerGroup(opId: number, messageId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let message = messageLines[0]
        if (message.length > this.param.searchContentLimit) {
            this.logger.info(`${opId}| search content too long from [${messageInfo.sender_user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.param.searchContentLimit}`
        }
        let resultPriceListLimit = this.param.resultPriceListLimitExtended
        let resultNameListLimit = this.param.resultNameListLimitExtended
        let eve_server: eveServer = messageSource.eve_server
        let eve_marketApi: eveMarketApi = messageSource.eve_marketApi
        let isExtendedMode = false
        if (startsWith(message, `tq `) || startsWith(message, `TQ `)) {
            message = trim(message.slice(2))
            eve_server = eveServer.tranquility
        }
        perfUtil.reset()
        let result = await this.extService.models.modelEveESIUniverseTypes.SearchByGroupNames([message], resultNameListLimit + 1, true)
        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish market search ${message}`)
        if (result.length == 0) {
            this.logger.info(`${opId}| 找不到 ${message}`)
            return '找不到该物品'
        } else if (result.length > 0 && result.length <= resultPriceListLimit) {
            if (isExtendedMode && result.length > this.param.resultPriceListLimit) {
                this.QQBot.replyMessage(opId, messageInfo, `M${messageId} | 共有 ${result.length}项条目，查询API中`)
            }
            if (eve_marketApi === eveMarketApi.ceveMarket) {
                let head = `M${messageId} | 共有${result.length}种物品符合该条件, ${eveServerInfo[eve_server].dispName}市场价格:\n`
                perfUtil.reset()
                let marketdata: string[] = await Promise.all(result.map(async item => {
                    let market = await this.extService.CEVEMarketApi.getMarketString(opId, item.id.toString(), eve_server)
                    return `🔹${itemNameDisp(item)}\n ${market}`;
                }))
                this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api data`)
                return `${head}${join(marketdata, "\n")}` + `\n当前服务器[${eveServerInfo[eve_server].dispName}] | 当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName} | 耗时${perf.timePastStrMS()}`;
            } else {
                return "市场API配置错误"
            }
        } else {
            this.logger.info(`${opId}| 搜索结果过多: ${result.length}, 需少于${resultPriceListLimit}个`)
            if (result.length > resultNameListLimit) {
                return `共有超过${resultNameListLimit}种物品符合符合该条件，请给出更明确的物品名称\n${formatItemNames(result)}\n......`
            } else {
                return `共有${result.length}种物品符合符合该条件，请给出更明确的物品名称\n${formatItemNames(result)}`
            }
        }
    }
    async handler(opId: number, messageId: number, messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        if (messagePacket.message === "") {
            return `1| .jita {物品名}`
                + `\n` + `2| .jita {物品ID}`
                + `\n` + `3| .jita group {类型名}`
                + `\n` + `4| .jita TQ {物品名}  ---  使用世界服数据`
                + `\n` + `5| .jita EXT {物品名}  ---  扩展查询模式，最大${this.param.resultPriceListLimitExtended}条市场项目`
                + `\n` + `6| .jita`
                + `\n` + `   {EVE舰船装配}`
                + `\n` + `  --- 查询EVE舰船装配价格`
                + `\n` + `7| .jita`
                + `\n` + `   {合同内容复制}`
                + `\n` + `  --- 查询合同内容价格`
        }
        let messageLines = messagePacket.message.split("\n").map((line) => { return trimEnd(line, "\r") });
        if (messageLines.length <= 1) {

            if (startsWith(messageLines[0], `group `) || startsWith(messageLines[0], `GROUP `)) {
                messageLines[0] = trim(messageLines[0].slice(5))
                let result = await this.handlerGroup(opId, messageId, messageLines, messageSource, messageInfo, messagePacket)
                if (result !== false) {
                    return result
                }
            }
            let result = await this.handlerSingleItem(opId, messageId, messageLines, messageSource, messageInfo, messagePacket)
            if (result !== false) {
                return result
            }
        } else {
            this.logger.log(`${opId}| first line is ${messageLines[0]}`)
            let result = await this.handlerEveFit(opId, messageId, messageLines, messageSource, messageInfo, messagePacket)
            if (result !== false) {
                return result
            }

            result = await this.handlerContract(opId, messageId, messageLines, messageSource, messageInfo, messagePacket)
            if (result !== false) {
                return result
            }
        }
        return "无法识别"
    }
}
