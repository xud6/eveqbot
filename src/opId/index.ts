
export interface tOpIdKvs {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string | null) => Promise<void>
}

export class opId {
    currentId: number;
    kvs: tOpIdKvs | null = null
    kvsKey: string = "opid"
    kvsSaveTimer: NodeJS.Timeout | null
    kvsSaveInterval_s: number = 10
    constructor() {
        this.currentId = 0;
    }
    async startup() {
        this.kvsSaveTimer = setInterval(() => {
            if (this.kvs) {
                this.kvs.set(this.kvsKey, this.currentId.toString())
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
        this.currentId = this.currentId + dbid + this.kvsSaveInterval_s * 100
        await this.kvs.set(this.kvsKey, this.currentId.toString())
    }
}