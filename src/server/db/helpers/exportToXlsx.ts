import Excel from "exceljs";
import koa from "koa";
import postgres from "postgres";
import { serverConfig } from "../../configuration";
import { log } from "../../log";
import { EextensionsType } from "../../enums";
import { addDoubleQuotes, asyncForEach, getUrlKey, hidePassword, removeEmpty } from "../../helpers";
import { models } from "../../models";

const addConfigToExcel = async ( workbook: Excel.Workbook, config: object ) => {
  const worksheet = workbook.addWorksheet("Config");
  const cols: Partial<Excel.Column>[] = [
    { key: "key", header: "key" },
    { key: "value", header: "value" }
  ];
  worksheet.columns = cols;
  worksheet.columns.forEach((sheetColumn) => {
    sheetColumn.font = {
      size: 12,
    };
    sheetColumn.width = 30;
  });  

  worksheet.getRow(1).font = {
    bold: true,
    size: 13,
  };

  Object.keys(config).forEach((item: string) => {
    worksheet.addRow({key: item, value: typeof config[item] === "object" ? Array(config[item]).toString() : config[item]});
  });
  
};

const addToExcel = async ( workbook: Excel.Workbook, name: string, input: object ) => {
  if (input && input[0]) {
    const worksheet = workbook.addWorksheet(name);
    const cols: Partial<Excel.Column>[] = [];    
    Object.keys(input[0]).forEach((temp: string) => { cols.push({ key: temp, header: temp }); });
      
    worksheet.columns = cols;
    worksheet.columns.forEach((sheetColumn) => { sheetColumn.font = { size: 12, }; sheetColumn.width = 30; });
  
    if (Object.values(input).length > 0) {
        worksheet.getRow(1).font = { bold: true, size: 13, };
        Object.values(input).forEach((item: any) => { worksheet.addRow(item); });
    }
  }
};

// Create column List
const createColumnsList = async (ctx: koa.Context, entity: string) => {
  const columnList: string[] = [];
  await asyncForEach(
    Object.keys(ctx.model[entity].columns),
    async (column: string) => {
      const createQuery = (input: string) => `select distinct ${input} AS "${column}" from "${ctx.model[entity].table}" LIMIT 200`;
      if (ctx.model[entity].columns[column].create !== "") {
        // IF JSON create column-key  note THAT is limit 200 firts items
        if (models.isColumnType(ctx.config, ctx.model[entity], column, "json")) {
          const tempSqlResult = await serverConfig.connection(ctx.config.name).unsafe(createQuery(`jsonb_object_keys("${column}")`))
            .catch(async (e) => {
              if (e.code === "22023") {
                const tempSqlResult = await serverConfig.connection(ctx.config.name).unsafe(createQuery(`jsonb_object_keys("${column}"[0])`)).catch(async (e) => {
                  if (e.code === "42804") {
                    const tempSqlResult = await serverConfig.connection(ctx.config.name).unsafe(createQuery(`jsonb_object_keys(jsonb_array_elements("${column}"))`));
                    if (tempSqlResult && tempSqlResult.length > 0) 
                      tempSqlResult.forEach((e: Iterable<postgres.Row> ) => { columnList.push( `jsonb_array_elements("${column}")->>'${e[column]}' AS "${column}-${e[column]}"`); });
                  } else log.errorMsg(e);
                });    
                if (tempSqlResult && tempSqlResult.length > 0) 
                  tempSqlResult.forEach((e: Iterable<postgres.Row> ) => { columnList.push( `"${column}"[0]->>'${e[column]}' AS "${column}-${e[column]}"`); });
              } else log.errorMsg(e);
            });            
            if (tempSqlResult && tempSqlResult.length > 0) 
              tempSqlResult.forEach((e: Iterable<postgres.Row> ) => { columnList.push( `"${column}"->>'${e[column]}' AS "${column}-${e[column]}"`); });
            
        } else columnList.push(`"${column}"`);
      }
    });    
  return columnList;
};

const exportToXlsx = async (ctx: koa.Context) => {
  // CReate new workBook
  const workbook = new Excel.Workbook();
  workbook.creator = "Me";
  workbook.lastModifiedBy = "Her";
  workbook.created = new Date(Date.now());
  workbook.modified = new Date(Date.now());
  // Get configs infos
  addConfigToExcel(workbook, serverConfig.getConfigForExcelExport(ctx.config.name));
  // Loop on entities
  await asyncForEach(
    Object.keys(ctx.model).filter(
      (entity: string) =>
        ctx.model[entity].table !== "" &&
        [EextensionsType.base,
          EextensionsType.multiDatastream,
          EextensionsType.lora].some((r) => ctx.model[entity].extensions.includes(r))
    ),
    async (entity: string) => {
      const cols = await createColumnsList(ctx, entity);      
      const temp = await serverConfig.connection(ctx.config.name).unsafe(`select ${cols} from "${ctx.model[entity].table}" LIMIT 200`);  
      await addToExcel(workbook, entity, temp);
  });
  // Save file
  ctx.status = 200;
  ctx.response.attachment(`${ctx.config.name}.xlsx`);
  await workbook.xlsx.write(ctx.res);
  // Close all
  ctx.res.end();
};

const exportToJson = async (ctx: koa.Context) => {
  // get config with hidden password
  const result = { "create": hidePassword(serverConfig.getConfig(ctx.config.name))};
  // get entites list
  const entities = Object.keys(ctx.model).filter((e: string) => ctx.model[e].createOrder > 0);
  // remove key ebservation by ThingsLocations
  // entities[entities.indexOf('Observations')] = ctx.model.ThingsLocations.name;
  entities.push(ctx.model.ThingsLocations.name);
  // async loop
  await asyncForEach(
    // Entities list
    entities,
    // Action
    async (entity: string) => {
      if(Object.keys(ctx.model[entity].columns)) {
        // Create columns list
        const columnList = Object.keys(ctx.model[entity].columns).filter((e: string) => e != "id" && !e.endsWith('_id') && e[0] != '_' && ctx.model[entity].columns[e].create != "");
        // Create relations list
        const rels = [""];
        Object.keys(ctx.model[entity].columns).filter((e: string) => e.endsWith('_id')).forEach((e: string) => {
          const table = e.split("_")[0];
          rels.push(`CASE WHEN "${e}" ISNULL THEN NULL ELSE JSON_BUILD_OBJECT('@iot.name', (SELECT REPLACE (name, '''', '''''') FROM "${table}" WHERE "${table}"."id" = ${e} LIMIT 1)) END AS "${e}"`);          
        });   
        const columnListWithQuotes = columnList.map(e => addDoubleQuotes(e)).join();        
        if (columnListWithQuotes.length <= 1) rels.shift();
        // Bulid query
        const sql = `select ${columnListWithQuotes}${rels.length > 1 ? rels.join() : ""}\n from "${ctx.model[entity].table}" LIMIT ${getUrlKey(ctx.request.url, "limit") || ctx.config.nb_page}`;
        // Execute query
        const temp = await serverConfig.connection(ctx.config.name).unsafe(sql);  
        // remove null and store datas result 
        result[entity] = removeEmpty(temp);        
      }  
  });
  // remove default columnListWithQuotes
  delete result["FeaturesOfInterest"][0];
  return result;
};

export const exportService = async (ctx: koa.Context) => {
  return (ctx.url.includes("xls")) ? exportToXlsx(ctx) : exportToJson(ctx);
};