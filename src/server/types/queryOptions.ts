/**
 * query interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Ientities, Iuser } from ".";

export interface IqueryOptions {
    user: Iuser;
    methods: string[];
    metrics: string[] | {[key: string] : any};
    entity: string;
    subentity?: string;
    id: string;
    method?: string;
    options: string;
    version: string;
    services: string[];
    host: string;
    datas?: JSON;
    results?: JSON | string;
    graph: boolean;
    admin: boolean;
    _DATAS : Ientities
}