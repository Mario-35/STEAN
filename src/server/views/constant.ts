import { IEntity, IUser } from "../types";

export interface IQuery {
    user: IUser;
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
    _DATAS : { [k: string]: IEntity; }
}

export const userHeader: {[key: string]: string} = Object.freeze({
    "canPost": "post",
    "canDelete": "Delete",
    "canCreateUser": "Create User",
    "canCreateDb": "Create DB",
    "admin": "admin",
    "superAdmin": "Super Admin"
});
