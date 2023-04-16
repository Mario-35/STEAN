/**
 * query interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientity, Iuser } from ".";

export interface Iquery {
    user: Iuser;
    methods: string[];
    entity: string;
    subentity?: string;
    id: string;
    method?: string;
    options: string;
    version: string;
    host: string;
    datas?: JSON;
    results?: JSON | string;
    graph: boolean;
    admin: boolean;
    _DATAS : { [k: string]: Ientity; }
}