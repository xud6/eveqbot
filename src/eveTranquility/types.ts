import { cModels } from "../models";
import { eveESI } from "../api/eveESI";

export interface eveTranquilityExtService {
    models: cModels,
    eveESI: eveESI
}
