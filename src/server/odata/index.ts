import { query, resourcePath } from "./parser/parser";
import { Token } from "./parser/lexer";
import koa from "koa";
import { cleanUrl } from "../helpers";
import { serverConfig } from "../configuration";
import { PgVisitor } from "./visitor/PgVisitor";
import { SqlOptions } from "./parser/sqlOptions";
import { _DB } from "../db/constants";
export { PgVisitor } from "./visitor/PgVisitor";

const doSomeWarkAfterAst = async (input: PgVisitor, ctx: koa.Context) => {    
    if ( input.splitResult && input.splitResult[0].toUpperCase() == "ALL" && input.parentId && <bigint>input.parentId > 0) {
        const temp = await serverConfig.db(ctx._config.name).raw(`select jsonb_agg(tmp.units -> 'name') as keys from ( select jsonb_array_elements("unitOfMeasurements") as units from ${_DB.MultiDatastreams.table} where id = ${input.parentId} ) as tmp`);
        input.splitResult = temp.rows[0]["keys"];
    }   
};

export const createOdata = async (ctx: koa.Context):Promise<PgVisitor | undefined> => {
    const blankUrl = `$top=${ctx._config.nb_page ? ctx._config.nb_page : 200}`;
    const options: SqlOptions = {loraId: undefined, rootBase: ctx._rootName, onlyValue: false, onlyRef: false, method: ctx.method, name: ""};

    let urlSrc = ctx.href.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(ctx._config.apiVersion)[1];

    const removeElement = (input: string) => {
        urlSrc = urlSrc.replace(`&${input}`, "");
        urlSrc = urlSrc.replace(input, "");
    };    

    if (urlSrc.includes("/Configs(")) {
        const nameConfig = urlSrc.split("/Configs(").join("").split(")")[0];   
        options.name = nameConfig;
        urlSrc = urlSrc.replace(nameConfig, "1");        
    }

    if (urlSrc.includes("/Loras(")) {
        const idLora = urlSrc.split("/Loras(").join("").split(")")[0];      
        if(isNaN(+idLora)) {
            options.loraId = idLora;
            urlSrc = urlSrc.replace(idLora, "0");
        }        
    }

    // urlSrc = cleanUrl(urlSrc);
    // urlSrc = cleanUrl(urlSrc.replace(/\@iot.id\b/, "id"));
    urlSrc = cleanUrl(urlSrc.replace(/@iot.id/g, "id"));
    
    
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
            }
        });

        const urlSrcSplit = urlSrc.split("?");
        
        if(!urlSrcSplit[1]) urlSrcSplit.push(blankUrl);  
        
        if (urlSrcSplit[0].split("(").length != urlSrcSplit[0].split(")").length) urlSrcSplit[0] += ")";
        
        const astRessources:Token = <Token>(resourcePath(<string>urlSrcSplit[0]));   
        
        const astQuery: Token = <Token>query(decodeURIComponent(urlSrcSplit[1]));
        
        const temp = new PgVisitor(options).init(ctx, astRessources).start(ctx, astQuery);

        await doSomeWarkAfterAst(temp, ctx);
        
        return temp;
};

