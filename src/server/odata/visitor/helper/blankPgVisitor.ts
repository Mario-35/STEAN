/**
 * blankPgVisitor.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { PgVisitor } from "../..";
import { log } from "../../../log";
import { Ientity } from "../../../types";
import { Token } from "../../parser";
import { query, resourcePath } from "../../parser/parser";


export const blankPgVisitor = (ctx: koa.Context, entity: Ientity): PgVisitor | undefined => {  
    const astRessources: Token = <Token>resourcePath(entity.name);  
    const astQuery: Token = <Token>query(decodeURIComponent(`$top=${ctx.config.nb_page ? ctx.config.nb_page : 200}`));
    try {
      return new PgVisitor(ctx, {
        onlyValue: false,
        onlyRef: false,
        valueskeys: false,
      }) .init(astRessources) .start(astQuery);    
    } catch (error) {
      log.errorMsg(error);
      return undefined;
    }
  }