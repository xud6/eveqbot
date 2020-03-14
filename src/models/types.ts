import { typeormdb } from "../db";
import { eveESI } from "../eveESI";
import { opId } from "../opId";

export interface tModelsConfig {

}

export interface tModelsExtService {
    db: typeormdb,
    eveESI: eveESI,
    opId: opId
}
