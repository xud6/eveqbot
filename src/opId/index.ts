import { tLogger } from "tag-tree-logger";

export interface tOpIdKvs {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string | null) => Promise<void>
}

export class opId {
    logger: tLogger
    currentId: number;
    kvs: tOpIdKvs | null = null
    kvsKey: string = "opid"
    kvsSaveTimer: NodeJS.Timeout | null
    kvsSaveInterval_s: number = 10
    constructor(
        readonly parentLogger: tLogger
    ) {
        this.logger = parentLogger.logger(["opid"])
        this.currentId = 0;
    }
    async startup() {
        this.kvsSaveTimer = setInterval(async () => {
            if (this.kvs) {
                let id = this.currentId.toString()
                await this.kvs.set(this.kvsKey, id)
                this.logger.log(`save current id ${id}`)
            }
        }, this.kvsSaveInterval_s * 1000)
    }
    async shutdown() {
        if (this.kvsSaveTimer) {
            clearInterval(this.kvsSaveTimer)
        }
    }
    getId() {
        return this.currentId++
    }
    async setPersistentKvs(kvs: tOpIdKvs, key: string = "srvOpIdCurrent") {
        this.kvs = kvs;
        this.kvsKey = key;
        let dbid: number = 0;
        try {
            let v = await this.kvs.get(this.kvsKey)
            if (v) {
                let i = parseInt(v);
                if (i) {
                    dbid = i
                }
            }
        } catch (e) {

        }
        if (dbid) {
            this.currentId = this.currentId + dbid + this.kvsSaveInterval_s * 100
            this.logger.info(`load id from data, current is ${this.currentId}`)
        }
        await this.kvs.set(this.kvsKey, this.currentId.toString())
    }
}