import { logger, logDriverConsole } from 'tag-tree-logger';

let sLogger = new logger([new logDriverConsole()], []);
let globalLogger = sLogger.logger(['global'])

globalLogger.info(`======Finish init logging system======`)

import dumpToFileSync from '@xud6/dump-to-file-sync'
import util from 'util'
process.on('unhandledRejection', (reason, p) => {
    dumpToFileSync((new Date).toISOString() + "\n----------\n" + util.format(reason) + "\n----------\n" + util.format(p), 'unhandledRejection')
    globalLogger.error('Unhandled Rejection ' + util.format(reason));
    globalLogger.error(util.format(p))
    // application specific logging, throwing an error, or other logic here
});

globalLogger.info(`======loading config======`)

import config from './config'

globalLogger.info(`===  current config  ===`)
globalLogger.info(config)
globalLogger.info(`========================`)

globalLogger.info(`======loading modules======`)

import { eveqbot } from './index';

let bot: eveqbot | undefined

process.on('SIGINT', async function () {
    globalLogger.info("\ngracefully shutting down from SIGINT (Crtl-C)")
    setTimeout(() => {
        console.log("force shutdown after timeout")
        process.exit()
    }, 1000 * 10)
    if (bot) {
        await bot.shutdown()
        globalLogger.info("node successfuly shutdown");
    }
    process.exit()
})

async function startNode() {
    try {
        globalLogger.info('--------set logger tags--------');
        for (let logTagCfg of config.logger) {
            globalLogger.info(config)
            if (logTagCfg.state) {
                sLogger.logEnable([logTagCfg.name])
            } else {
                sLogger.logDisable([logTagCfg.name])
            }
        }
        globalLogger.info('--------service is starting--------');
        bot = new eveqbot(sLogger, {}, config)
        await bot.startup()
        globalLogger.info('--------service start success--------');
    } catch (e) {
        globalLogger.error(e);
        dumpToFileSync((new Date).toISOString() + "\n----------\n" + util.format(e), 'Service-Crash')
        globalLogger.fault('service startup failed!!!!!!');
    }
}

startNode();