import { typeormdb } from "../db";
import { eveESI } from "../api/eveESI";
import { opId } from "../opId";

export interface tModelsConfig {
    noLog: boolean
}

export interface tModelsExtService {
    db: typeormdb,
    eveESI: eveESI,
    opId: opId
}
