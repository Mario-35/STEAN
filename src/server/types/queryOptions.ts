/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * query interface.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IdecodedUrl, Ientities, IserviceLink, Iuser } from ".";

export interface IqueryOptions {
    user: Iuser;
    methods: string[];
    entity: string;
    subentity?: string;
    method?: string;
    options: string;
    services: { [key: string]: IserviceLink };
    decodedUrl: IdecodedUrl;
    datas?: JSON;
    results?: JSON | string;
    graph: boolean;
    admin: boolean;
    _DATAS : Ientities
}