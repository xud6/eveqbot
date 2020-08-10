import { cModels } from "../models";
import { parse } from "path";

export class messageId {
    readonly KVNameMessageId: string
    constructor(
        readonly models: cModels,
        readonly KVPrefix: string = "bot.messageId"
    ) {
        this.KVNameMessageId = `${this.KVPrefix}.id`
    }
    async getMessageId():Promise<number> {
        let current = await this.models.modelKvs.get(this.KVNameMessageId);
        try{
            if(current){
                let id = parseInt(current);
                if(id){
                    id++;
                    await this.models.modelKvs.set(this.KVNameMessageId,id.toString());
                    return id;
                }
            }
        }catch(e){

        }
        let id = 1;
        await this.models.modelKvs.set(this.KVNameMessageId,id.toString());
        return id;
    }
}