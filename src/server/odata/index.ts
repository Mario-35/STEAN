/**
 * pgVisitor index.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { query, resourcePath } from "./parser/parser";
import { Token } from "./parser/lexer";
import koa from "koa";
import { cleanUrl } from "../helpers";
import { serverConfig } from "../configuration";
import { PgVisitor } from "./visitor/PgVisitor";
import { SqlOptions } from "./parser/sqlOptions";
import { queryMultiDatastreamKeys } from "../db/queries";
export { PgVisitor } from "./visitor/PgVisitor";

const doSomeWarkAfterCreateAst = async (input: PgVisitor, ctx: koa.Context) => {
  if ( input.splitResult && input.splitResult[0].toUpperCase() == "ALL" && input.parentId && <bigint>input.parentId > 0 ) {
    const temp = await serverConfig.getConnection(ctx.config.name).unsafe(`${queryMultiDatastreamKeys(input.parentId)}`);
    input.splitResult = temp[0]["keys"];
  }
};

const escapesOdata = (input: string) : string => {
  const codes = { "/" : "%252F", "\\" : "%255C" };
  const pop:string[] = [];
  input.split("%27").forEach((v: string,i: number) => {
    if (i > 0) Object.keys(codes).forEach((code: string) => v = v.split(code).join(codes[code]));
    pop.push(v);
  });
  return pop.join("%27");
};

export const createOdata = async (ctx: koa.Context): Promise<PgVisitor | undefined> => {
  // blank url if not defined
  // init Ressource wich have to be tested first

  const options: SqlOptions = {
    onlyValue: false,
    onlyRef: false,
    valueskeys: false,
  };

  // normalize href
  let urlSrc = `${ctx.decodedUrl.path}${ctx.decodedUrl.search}`;
    

  if (urlSrc && urlSrc.trim() != "") urlSrc = escapesOdata(urlSrc);  
  // replace element  
  const clean = (replaceThis: string, by?: string) => urlSrc = urlSrc.split(replaceThis).join(by ? by : "");

  // function to remove element in url
  const removeElement = (input: string) => {
    clean(`&${input}`);
    clean(input);
  };
  
  clean("geography%27", "%27"); 

  // intercept deveui loras identification and save it befor delete it for comptibility with number id

  
  // clean id in url
  urlSrc = cleanUrl(clean("@iot.id", "id"));

  if (urlSrc === "/") return;

  if (urlSrc.includes("$"))
    urlSrc.split("$").forEach((element: string) => {
      switch (element) {
        case "value?":
        case "value":
          options.onlyValue = true;
          removeElement(`/$${element}`);
          break;
        case "ref":
          options.onlyRef = true;
          removeElement(`/$${element}`);
          break;
        case "valuesKeys=true":
          options.valueskeys = true;
          removeElement(`$${element}`);
          break;
      }
    });
    
  const urlSrcSplit = cleanUrl(urlSrc).split("?");

  if (!urlSrcSplit[1]) urlSrcSplit.push(`$top=${ctx.config.nb_page ? ctx.config.nb_page : 200}`);

  if (urlSrcSplit[0].split("(").length != urlSrcSplit[0].split(")").length) urlSrcSplit[0] += ")";

  const astRessources: Token = <Token>resourcePath(<string>urlSrcSplit[0]);  

  const astQuery: Token = <Token>query(decodeURIComponent(urlSrcSplit[1]));

  const temp = new PgVisitor(ctx, options)
    .init(astRessources)
    .start(astQuery);

  await doSomeWarkAfterCreateAst(temp, ctx);

  return temp;
};
