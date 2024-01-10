import Excel from "exceljs";
import koa from "koa";
import postgres from "postgres";
import { serverConfig } from "../../configuration";
import { log } from "../../log";
import { EextensionsType } from "../../enums";
import { addDoubleQuotes, asyncForEach, hidePasswordIn } from "../../helpers";
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
    Object.keys(ctx._model[entity].columns),
    async (column: string) => {
      const createQuery = (input: string) => `select distinct ${input} AS "${column}" from "${ctx._model[entity].table}" LIMIT 200`;
      if (ctx._model[entity].columns[column].create !== "") {
        // IF JSON create column-key  note THAT is limit 200 firts items
        if (models.isColumnType(ctx._config, ctx._model[entity], column, "json")) {
          const tempSqlResult = await serverConfig.getConnection(ctx._config.name).unsafe(createQuery(`jsonb_object_keys("${column}")`))
            .catch(async (e) => {
              if (e.code === "22023") {
                const tempSqlResult = await serverConfig.getConnection(ctx._config.name).unsafe(createQuery(`jsonb_object_keys("${column}"[0])`)).catch(async (e) => {
                  if (e.code === "42804") {
                    const tempSqlResult = await serverConfig.getConnection(ctx._config.name).unsafe(createQuery(`jsonb_object_keys(jsonb_array_elements("${column}"))`));
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
  addConfigToExcel(workbook, serverConfig.getConfigForExcelExport(ctx._config.name));
  // Loop on entities
  await asyncForEach(
    Object.keys(ctx._model).filter(
      (entity: string) =>
        ctx._model[entity].table !== "" &&
        [EextensionsType.base,
          EextensionsType.multiDatastream,
          EextensionsType.lora].some((r) => ctx._model[entity].extensions.includes(r))
    ),
    async (entity: string) => {
      const cols = await createColumnsList(ctx, entity);      
      const temp = await serverConfig.getConnection(ctx._config.name).unsafe(`select ${cols} from "${ctx._model[entity].table}" LIMIT 200`);  
      await addToExcel(workbook, entity, temp);
  });
  // Save file
  ctx.status = 200;
  ctx.response.attachment(`${ctx._config.name}.xlsx`);
  await workbook.xlsx.write(ctx.res);
  // Close all
  ctx.res.end();
};

const exportToJson = async (ctx: koa.Context) => {
  const result = { "create": hidePasswordIn(serverConfig.getConfig(ctx._config.name))};
  const entities = Object.keys(ctx._model).filter((e: string) => ctx._model[e].createOrder > 0);
  entities[entities.indexOf('Observations')] = ctx._model.ThingsLocations.name;
  console.log(entities);

  await asyncForEach(
    entities,
    async (entity: string) => {
      if(Object.keys(ctx._model[entity].columns)) {
        const cols = Object.keys(ctx._model[entity].columns).filter((e: string) => e != "id" && !e.endsWith('_id') && e[0] != '_' && ctx._model[entity].columns[e].create != "");
        const rels = [""];
        Object.keys(ctx._model[entity].columns).filter((e: string) => e.endsWith('_id')).forEach((e: string) => {
          const table = e.split("_")[0];
          const entity = models.getEntityName(ctx._config, table);
          const temp = `(select "name" FROM "${table}" where "${table}"."id" = id LIMIT 1) AS "${entity}"`;
          rels.push(temp);
        });   
        
        const myCols = cols.map(e => addDoubleQuotes(e)).join();
        
        if (myCols.length <= 1) rels.shift();
        const sql = `select ${myCols}${rels.length > 1 ? rels.join() : ""}\n from "${ctx._model[entity].table}" LIMIT 200`;  
        const temp = await serverConfig.getConnection(ctx._config.name).unsafe(sql);  
        result[entity] = (temp);
      }  
  });
  return result;
};

export const exportService = async (ctx: koa.Context) => {
  return (ctx.url.includes("xls")) ? exportToXlsx(ctx) : exportToJson(ctx);
};