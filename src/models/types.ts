import { typeormdb } from "../db";
import { eveESI } from "../eveESI";

export interface tModelsConfig {
    
}

export interface tModelsExtService {
    db: typeormdb,
    eveESI: eveESI
}
