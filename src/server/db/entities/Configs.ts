/**
 * Configs entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { Knex } from "knex";
import koa from "koa";
import { Common } from "./common";
import { Logs } from "../../logger";
import { IconfigFile, IreturnResult } from "../../types";
import { CONFIGURATION } from "../../configuration";
import { hidePasswordInJson } from "../../helpers";
import { messages, messagesReplace } from "../../messages";
import { ensureAuthenticated } from "../../authentication";
import { db } from "..";

export class Configs extends Common {
     constructor(ctx: koa.Context, knexInstance?: Knex | Knex.Transaction) {
         super(ctx, knexInstance);
     }
     boule(input: boolean):string {
        return (input === true) ? "TRUE" : "FALSE";
     }
     async getAll(): Promise<IreturnResult | undefined> {
        Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `getAll`]));    
        if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
        const result: { [key: string]: IconfigFile; } = {};
        Object.keys(CONFIGURATION.list).filter(e => e != "admin").forEach((elem: string) => {
            result[elem] = CONFIGURATION.list[elem];
        });
        return this.createReturnResult({ body: hidePasswordInJson(result) });       
     }

     async getSingle(idInput: bigint | string): Promise<IreturnResult | undefined> {
         Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `getSingle`]));    
         if(idInput === "ajout") {
            console.log("============= ajout in config =========================================");
            Object.keys(CONFIGURATION.list).forEach((elem: string) => {
                console.log(`=============> ${elem}`);
                const lol = {
                    key: CONFIGURATION.list[elem].key ,
                    pghost: CONFIGURATION.list[elem].pg_host ,
                    pgport: CONFIGURATION.list[elem].pg_port ,
                    port: CONFIGURATION.list[elem].port ,
                    pguser: CONFIGURATION.list[elem].pg_user ,
                    pgpassword: CONFIGURATION.list[elem].pg_password ,
                    apiVersion: CONFIGURATION.list[elem].apiVersion ,
                    dateformat: CONFIGURATION.list[elem].date_format ,
                    webSite: CONFIGURATION.list[elem].webSite ,
                    nbpage: CONFIGURATION.list[elem].nb_page ,
                    retry: CONFIGURATION.list[elem].retry ,
                    createUser: CONFIGURATION.list[elem].createUser ,
                    forceHttps: CONFIGURATION.list[elem].forceHttps ,
                    alias: CONFIGURATION.list[elem].alias ,
                    lora: CONFIGURATION.list[elem].lora ,
                    multiDatastream: CONFIGURATION.list[elem].multiDatastream ,
                    highPrecision: CONFIGURATION.list[elem].highPrecision ,
                    logFile: CONFIGURATION.list[elem].logFile                     
                };


                db["admin"]
                        .table("config")
                        .insert({ name: CONFIGURATION.list[elem].name , ...lol})
                        .catch((err: Error) => {
                            if (err["code"] === "23505") {
                                db["admin"]
                                .table("config")
                                .update(lol)
                                .where({name: CONFIGURATION.list[elem].name})
                                .catch((err: Error) => {
                                    console.log(err);                                    
                                });

                            }
                            
                        });
            });        
         }
         
        if (!ensureAuthenticated(this.ctx)) this.ctx.throw(401);
        return this.createReturnResult({ body: hidePasswordInJson(CONFIGURATION.list[typeof idInput === "string" ? idInput : this.ctx._configName]) });       
    }


     async add(dataInput: object | undefined): Promise<IreturnResult | undefined> {
         Logs.override(messagesReplace(messages.infos.classConstructor, [this.constructor.name, `add`]));    
         console.log("============>");
         console.log(dataInput);
         
         if (!dataInput) return;
         return this.createReturnResult({ body: await CONFIGURATION.add(dataInput), });
    }

 }
 