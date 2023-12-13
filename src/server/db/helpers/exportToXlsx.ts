import Excel from "exceljs";
import koa from "koa";
import postgres from "postgres";
import { isColumnType } from ".";
import { serverConfig } from "../../configuration";
import { EextensionsType } from "../../enums";
import { asyncForEach } from "../../helpers";
import { Logs } from "../../logger";
import { _DB } from "../constants";

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
    console.log(typeof config[item]);
    console.log(config[item]);
    
    worksheet.addRow({key: item, value: typeof config[item] === "object" ? Array(config[item]).toString() : config[item]});
  });
  
};

const addToExcel = async ( workbook: Excel.Workbook, name: string, input: object ) => {
  if (input && input[0]) {
    const worksheet = workbook.addWorksheet(name);
    const cols: Partial<Excel.Column>[] = [];
    
    Object.keys(input[0]).forEach((temp: string) => {
      cols.push({ key: temp, header: temp });
    });
      
    worksheet.columns = cols;
    worksheet.columns.forEach((sheetColumn) => {
      sheetColumn.font = {
        size: 12,
      };
      sheetColumn.width = 30;
    });
  
    if (Object.values(input).length > 0) {
        worksheet.getRow(1).font = {
          bold: true,
          size: 13,
        };
        Object.values(input).forEach((item: any) => {
          worksheet.addRow(item);
        });
    }
  }
};

// Create column List
const createColumnsList = async (ctx: koa.Context, entity: string) => {
  const columnList: string[] = [];
  await asyncForEach(
    Object.keys(_DB[entity].columns),
    async (column: string) => {
      const createQuery = (input: string) => `select distinct ${input} AS "${column}" from "${_DB[entity].table}" LIMIT 200`;
      if (_DB[entity].columns[column].create !== "") {
        // IF JSON create column-key  note THAT is limit 200 firts items
        if (isColumnType(_DB[entity], column, "json")) {
          const tempSqlResult = await serverConfig.db(ctx._config.name).unsafe(createQuery(`jsonb_object_keys("${column}")`))
            .catch(async (e) => {
              if (e.code === "22023") {
                const tempSqlResult = await serverConfig.db(ctx._config.name).unsafe(createQuery(`jsonb_object_keys("${column}"[0])`)).catch(async (e) => {
                  if (e.code === "42804") {
                    const tempSqlResult = await serverConfig.db(ctx._config.name).unsafe(createQuery(`jsonb_object_keys(jsonb_array_elements("${column}"))`));
                    if (tempSqlResult && tempSqlResult.length > 0) 
                      tempSqlResult.forEach((e: Iterable<postgres.Row> ) => { columnList.push( `jsonb_array_elements("${column}")->>'${e[column]}' AS "${column}-${e[column]}"`); });
                  } else Logs.error(e);
                });    
                if (tempSqlResult && tempSqlResult.length > 0) 
                  tempSqlResult.forEach((e: Iterable<postgres.Row> ) => { columnList.push( `"${column}"[0]->>'${e[column]}' AS "${column}-${e[column]}"`); });
              } else Logs.error(e);
            });            
            if (tempSqlResult && tempSqlResult.length > 0) 
              tempSqlResult.forEach((e: Iterable<postgres.Row> ) => { columnList.push( `"${column}"->>'${e[column]}' AS "${column}-${e[column]}"`); });
            
        } else columnList.push(`"${column}"`);
      }
    });    
  return columnList;
};

export const exportToXlsx = async (ctx: koa.Context) => {
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
    ctx._config._context.entities.filter(
      (entity: string) =>
        _DB[entity].table !== "" &&
        [
          EextensionsType.base,
          EextensionsType.multiDatastream,
          EextensionsType.lora,
        ].some((r) => _DB[entity].extensions.includes(r))
    ),
    async (entity: string) => {
      const cols = await createColumnsList(ctx, entity);      
      const temp = await serverConfig.db(ctx._config.name).unsafe(`select ${cols} from "${_DB[entity].table}" LIMIT 200`);  
      await addToExcel(workbook, entity, temp);
  });
  // Save file
  ctx.status = 200;
  ctx.response.attachment(`${ctx._config.name}.xlsx`);
  await workbook.xlsx.write(ctx.res);
  // Close all
  ctx.res.end();
};