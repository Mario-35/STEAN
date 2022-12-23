import { IEntityColumnForm, IUser } from "../types";

export interface IQuery {
    user: IUser;
    methods: string[];
    entities?: string[];
    entity: string;
    subentity?: string;
    id: string;
    method?: string;
    options: string;
    version: string;
    host: string;
    datas?: JSON;
    results?: JSON | string;
    relations?: { [key: string]: string[] };
    columns?: { [key: string]: { [key: string]: IEntityColumnForm } };
    singulars?: { [key: string]: string };
    graph: boolean;
    admin: boolean;
}

export const userHeader: {[key: string]: string} = Object.freeze({
    "canPost": "post",
    "canDelete": "Delete",
    "canCreateUser": "Create User",
    "canCreateDb": "Create DB",
    "admin": "admin",
    "superAdmin": "Super Admin"
});
