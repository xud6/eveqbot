import { tCommandBase } from "./tCommandBase";
import { QQBotMessageSource } from "../../db/entity/QQBotMessageSource";
import { cQQBotExtService, cQQBot } from "..";
import { tLogger } from "tag-tree-logger";
import { eveMarketApi, eveServerInfo, eveMarketApiInfo } from "../../types";
import { join, startsWith, compact, trimEnd, replace, trim, orderBy } from "lodash";
import { itemNameDisp, formatItemNames, itemNameDispShort } from "../../utils/eveFuncs";
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
        resultPriceListLimit: 5,
        resultPriceListLimitExtended: 50,
        resultNameListLimit: 50,
        resultNameListLimitExtended: 100
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
    async handlerSingleItem(opId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let message = messageLines[0]
        if (message.length > this.param.searchContentLimit) {
            this.logger.info(`search content too long from [${messageInfo.sender_user_id}]`)
            return `查询内容过长，当前共${message.length}个字符，最大${this.param.searchContentLimit}`
        }
        let resultPriceListLimit = this.param.resultPriceListLimit
        let resultNameListLimit = this.param.resultPriceListLimit
        let isExtendedMode = false
        if (startsWith(message, "EXT ")) {
            this.logger.info(`${opId}| extended mode`)
            message = trim(replace(message, "EXT ", ""))
            resultPriceListLimit = this.param.resultPriceListLimitExtended
            resultNameListLimit = this.param.resultNameListLimitExtended
            isExtendedMode = true
        }
        perfUtil.reset()
        let items = await this.extService.models.modelEveESIUniverseTypes.MarketSearch(message, resultNameListLimit + 1)
        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish market search ${message}`)
        if (items.length == 0) {
            this.logger.info(`找不到 ${message}`)
            return '找不到该物品'
        } else if (items.length > 0 && items.length <= resultPriceListLimit) {
            if (isExtendedMode && items.length > this.param.resultPriceListLimit) {
                this.QQBot.replyMessage(messageInfo, `OP${opId} | 共有 ${items.length}项条目，查询API中`)
            }
            if (messageSource.eve_marketApi === eveMarketApi.ceveMarket) {
                let head = `OP${opId} | 共有${items.length}种物品符合条件[${message}]\n`
                perfUtil.reset()
                let marketdata: string[] = await Promise.all(items.map(async item => {
                    let market = await this.extService.CEVEMarketApi.getMarketString(item.id.toString(), messageSource.eve_server)
                    return `🔵${itemNameDisp(item)}\n ${market}`;
                }))
                this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api data`)
                return `${head}${join(marketdata, "\n")}` + `\n当前服务器[${eveServerInfo[messageSource.eve_server].dispName}] | 当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName} | 耗时${perf.timePastStrMS()}\n 使用 .jita 获取帮助 .help 查看其它功能`;
            } else {
                return "市场API配置错误"
            }
        } else {
            this.logger.info(`搜索结果过多: ${items.length}, 需少于${resultPriceListLimit}个`)
            if (items.length > resultNameListLimit) {
                return `共有超过${resultNameListLimit}种物品符合符合条件${message}，请给出更明确的物品名称\n${formatItemNames(items)}\n......`
            } else {
                return `共有${items.length}种物品符合符合条件${message}，请给出更明确的物品名称\n${formatItemNames(items)}`
            }
        }
    }
    async handlerEveFit(opId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let EVEFitHead = messageLines[0].match(EVEFitHeadRegexp)
        if (EVEFitHead) {
            let ship = EVEFitHead[1];
            this.logger.info(`EVE Fit Mode for ship ${ship}`)
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
            this.QQBot.replyMessage(messageInfo, `OP${opId} | EVE Fit 共有 ${inputItems.length}项条目，查询API中`)
            // this.logger.info(items)
            let result = [];
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
                        let marketData = await this.extService.CEVEMarketApi.getMarketData(type.id.toString())
                        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api of [${inputItem.name}]`)
                        if (marketData) {
                            result.push(
                                `🔵${itemNameDisp(type)}\n`
                                + ` ${this.extService.CEVEMarketApi.genMarketStringFromData(marketData)}`
                            )
                            resultSumSellLow += marketData.sellLow * inputItem.amount;
                            resultSumBuyHigh += marketData.buyHigh * inputItem.amount;
                            resultLineData.push({
                                amount: inputItem.amount,
                                itemType: type,
                                buyHighTotal: marketData.buyHigh * inputItem.amount,
                                sellLowTotal: marketData.sellLow * inputItem.amount
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
            let resultStr = `OP${opId} | `
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
            if (result.length) {
                resultStr += `可交易物品${result.length}种\n`
                resultStr += `最低卖价总计 ${numberFormat(resultSumSellLow, 2)} ,最高收价总计 ${numberFormat(resultSumBuyHigh, 2)}\n`
                resultLineData = orderBy(resultLineData, "sellLowTotal", "desc")
                resultStr += join(resultLineData.map((lineData) => {
                    return `🔵${lineData.amount} x ${itemNameDispShort(lineData.itemType)}\n 最低卖价: ${numberFormat(lineData.sellLowTotal, 2)} / 最高收价: ${numberFormat(lineData.buyHighTotal, 2)}`
                }), '\n') + '\n'
                resultStr += `\n详细价格\n`
                resultStr += join(result, '\n') + '\n'
                resultStr += `\n当前服务器[${eveServerInfo[messageSource.eve_server].dispName}] | 当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName} | 耗时${perf.timePastStrMS()}\n 使用 .jita 获取帮助 .help 查看其它功能`;
            }
            this.logger.info(`${opId}| finish handler evefit in ${perf.timePastStr()}`)
            return resultStr
        } else {
            return false
        }
    }
    async handlerContract(opId: number, messageLines: string[], messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | false | null> {
        let perf = new performance()
        let perfUtil = new performance()
        let EVEContractLine = messageLines[0].match(EVEContractLineRegexp)
        if (EVEContractLine) {
            let inputItems: { name: string, amount: number }[] = []
            let UnknowLines: string[] = []
            let result = [];
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
            this.QQBot.replyMessage(messageInfo, `OP${opId} | 共有 ${inputItems.length}项条目，查询API中`)
            for (let inputItem of inputItems) {
                perfUtil.reset()
                let type = (await this.extService.models.modelEveESIUniverseTypes.searchByExactName(inputItem.name))[0]
                this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish search item [${inputItem.name}]`)
                if (type) {
                    if (type.market_group_id !== null) {
                        perfUtil.reset()
                        let marketData = await this.extService.CEVEMarketApi.getMarketData(type.id.toString())
                        this.logger.info(`${opId}| ${perfUtil.timePastStr()} finish read market api [${inputItem.name}]`)
                        if (marketData) {
                            result.push(
                                `🔵${itemNameDisp(type)}\n`
                                + ` ${this.extService.CEVEMarketApi.genMarketStringFromData(marketData)}`
                            )
                            resultSumSellLow += marketData.sellLow * inputItem.amount;
                            resultSumBuyHigh += marketData.buyHigh * inputItem.amount;
                            resultLineData.push({
                                amount: inputItem.amount,
                                itemType: type,
                                buyHighTotal: marketData.buyHigh * inputItem.amount,
                                sellLowTotal: marketData.sellLow * inputItem.amount
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

            let resultStr = `OP${opId} | `
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
            if (result.length) {
                resultStr += `可交易物品${result.length}种\n`
                resultStr += `最高收价总计 ${numberFormat(resultSumBuyHigh, 2)} ,最低卖价总计 ${numberFormat(resultSumSellLow, 2)}\n`
                resultLineData = orderBy(resultLineData, "sellLowTotal", "desc")
                resultStr += join(resultLineData.map((lineData) => {
                    return `🔵${lineData.amount} x ${itemNameDispShort(lineData.itemType)}\n 最低卖价: ${numberFormat(lineData.sellLowTotal, 2)} / 最高收价: ${numberFormat(lineData.buyHighTotal, 2)}`
                }), '\n') + '\n'
                resultStr += `\n详细价格\n`
                resultStr += join(result, '\n') + '\n'
                resultStr += `\n当前服务器[${eveServerInfo[messageSource.eve_server].dispName}] | 当前市场API:${eveMarketApiInfo[messageSource.eve_marketApi].dispName} | 耗时${perf.timePastStrMS()}\n 使用 .jita 获取帮助 .help 查看其它功能`;
            }
            this.logger.info(`${opId}| finish handler contract ${perf.timePastStr()}`)
            return resultStr
        } else {
            return false
        }
    }
    async handler(messageSource: QQBotMessageSource, messageInfo: tMessageInfo, messagePacket: tQQBotMessagePacket): Promise<string | null> {
        let opId = this.extService.opId.getId()
        if (messagePacket.message === "") {
            return `1| .jita {物品名}`
                + `\n` + `2| .jita {物品ID}`
                + `\n` + `3| .jita EXT {物品名}  ---  扩展查询模式，最大${this.param.resultPriceListLimitExtended}条市场项目`
                + `\n` + `4| .jita`
                + `\n` + `   {EVE舰船装配}`
                + `\n` + `  --- 查询EVE舰船装配价格`
                + `\n` + `5| .jita`
                + `\n` + `   {合同内容复制}`
                + `\n` + `  --- 查询合同内容价格`
        }
        let messageLines = messagePacket.message.split("\n").map((line) => { return trimEnd(line, "\r") });
        if (messageLines.length <= 1) {
            let result = await this.handlerSingleItem(opId, messageLines, messageSource, messageInfo, messagePacket)
            if (result !== false) {
                return result
            }
        } else {
            this.logger.log(`first line is ${messageLines[0]}`)
            let result = await this.handlerEveFit(opId, messageLines, messageSource, messageInfo, messagePacket)
            if (result !== false) {
                return result
            }
            this.logger.info(messageLines)

            result = await this.handlerContract(opId, messageLines, messageSource, messageInfo, messagePacket)
            if (result !== false) {
                return result
            }
            this.logger.info(messageLines)

        }
        return null
    }
}