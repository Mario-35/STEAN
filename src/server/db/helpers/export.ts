import Excel from "exceljs";
import koa from "koa";
import path from "path";
import postgres from "postgres";
import { createInsertValues, executeSql } from ".";
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
    worksheet.addRow({key: item, value: config[item]});
  });
  
};

const addToExcel = async ( workbook: Excel.Workbook, name: string, input: object ) => {
  if (input && input[0]) {
    const worksheet = workbook.addWorksheet(name);
    const cols: Partial<Excel.Column>[] = [ { key: "insertId", header: "insertId" }, ];
    
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
        if (_DB[entity].columns[column].create.startsWith("json")) {
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
  addConfigToExcel(workbook, serverConfig.getConfigExport(ctx._config.name));
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

export const importOnglet = async ( workbook: Excel.Workbook, table: string, ctx: koa.Context ) => {
  const result = [{}];
  const ids: { [key: number]: number } = {};

  let names: object = {};
  const worksheet = workbook.getWorksheet(table);
  worksheet.eachRow(
    { includeEmpty: true },
    async (row: Excel.Row, rowNumber: number) => {
      const temp: object = {};
      if (rowNumber === 1) {
        names = row.values.toString().split(",");
        names = Object.assign({}, row.values.toString().split(","));
        // names = names.filter(e => e !== "" && e !== "id");
      } else {
        Object.keys(names).forEach((name: string) => {
          if (!["", "id", "insertId"].includes(names[name])) {
            temp[names[name]] = row.getCell(+name).value;
          }
        });
          await executeSql(ctx._config.name, `INSERT INTO "${_DB[table].table}" ${createInsertValues(temp, _DB[table].name)}`, true)
          .then((res: object) => { console.log(res); })
          .catch(async (error: Error) => {
            if (error["code"] === "23505") {
              await executeSql(ctx._config.name, `SELECT "id" FROM ${_DB[table].table}" WHERE "name" = '${temp["name"]}' LIMIT 1`, true).then(
                (res: object) => {
                  console.log(row.getCell(1).value);
                  row.getCell(1).value = +res["id"] + 100;
                  console.log( row.getCell(1).value + ":" + row.getCell(2).value + ":" + row.getCell(3).value + ":" + row.getCell(4).value + ":" + row.getCell(5).value + ":");
                });
            }
          });
          result.push(temp);
      }
    }
  );
  console.log(ids);
};

export const importToXlsx = async (ctx: koa.Context) => {
  const filePath = path.resolve(__dirname, "mario.xlsx");
  const workbook = new Excel.Workbook();
  workbook.xlsx.readFile(filePath).then(() => {
    importOnglet(workbook, "Sensors", ctx);
    importOnglet(workbook, "Locations", ctx);
    // let names:object = {};
    // const worksheet = workbook.getWorksheet(table);
    // worksheet.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
    // //   const add = {};
    // const temp:object = {};
    //   if (rowNumber === 1 ) {
    //     names = row.values.toString().split(",");
    //     names = Object.assign({}, row.values.toString().split(","));
    //     // names = names.filter(e => e !== "" && e !== "id");
    // } else {
    //     const vals = Object.assign({}, row.values.toString().split(","));
    //     Object.keys(names).forEach((name: string, index: number) => {
    //         if (!["","id"].includes(names[name])) {
    //             console.log(row.values);

    //             temp[names[name]] = vals[index];
    //         }
    //     });
    //     await serverConfig.db(ctx._config.name).table(_DB[table].table).insert(temp);

    //     result.push(temp);
    //   }
    // });
    // console.log(result);
  });
};
