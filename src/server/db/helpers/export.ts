import Excel from "exceljs";
import koa from "koa";
import path from "path";
import { createInsertValues, executeSql } from ".";
import { serverConfig } from "../../configuration";
import { EextensionsType } from "../../enums";
import { asyncForEach } from "../../helpers";
import { Logs } from "../../logger";
import { _DB } from "../constants";

const addConfigToFile = async (
  workbook: Excel.Workbook,
  config: object
) => {
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

const addToFile = async (
  workbook: Excel.Workbook,
  name: string,
  input: object
) => {
  const worksheet = workbook.addWorksheet(name);
  const cols: Partial<Excel.Column>[] = [
    { key: "insertId", header: "insertId" },
  ];
  input["fields"]
    .map((e: object) => e["name"])
    .forEach((temp: string) => {
      cols.push({ key: temp, header: temp });
    });
  worksheet.columns = cols;
  worksheet.columns.forEach((sheetColumn) => {
    sheetColumn.font = {
      size: 12,
    };
    sheetColumn.width = 30;
  });

  if (input["rows"] && input["rows"].length > 0) {
    if (Object.keys(input["rows"]).length > 0) {
      worksheet.getRow(1).font = {
        bold: true,
        size: 13,
      };
      Object(input["rows"]).forEach((item: any) => {
        worksheet.addRow(item);
      });
    }
  }
};

// Create column List
const createColumnsList = async (ctx: koa.Context, entity: string) => {
  const myclos: string[] = [];
  await asyncForEach(
    Object.keys(_DB[entity].columns),
    async (column: string) => {
      if (_DB[entity].columns[column].create !== "") {
        // IF JSON create column-key  note THAT is limit 200 firts items
        if (_DB[entity].columns[column].create.startsWith("json")) {
          const tempSqlResult = await executeSql(ctx._config.name, `select distinct jsonb_object_keys("${column}") AS "${column}" from "${_DB[entity].table}" LIMIT 200`)
            .catch(async (e) => {
              if (e.code === "22023") {
                return await executeSql(ctx._config.name, `select distinct jsonb_object_keys("${column}"[0]) AS "${column}" from "${_DB[entity].table}" LIMIT 200`);
              } else Logs.error(e);
            });
            if (tempSqlResult && tempSqlResult["rows"] && tempSqlResult["rows"].length > 0) {
              tempSqlResult["rows"].forEach((e: any) => {
                myclos.push(
                  `"${column}"->>'${e[column]}' AS "${column}-${e[column]}"`
                );
              });
            }
            
        } else myclos.push(`"${column}"`);
      }
    }
  );  
  return myclos;
};

export const exportToXlsx = async (ctx: koa.Context) => {
  const workbook = new Excel.Workbook();
  workbook.creator = "Me";
  workbook.lastModifiedBy = "Her";
  workbook.created = new Date(Date.now());
  workbook.modified = new Date(Date.now());
  addConfigToFile(workbook, serverConfig.getConfigExport(ctx._config.name));
  await asyncForEach(
    ctx._config.entities.filter(
      (entity: string) =>
        _DB[entity].table !== "" &&
        [
          EextensionsType.base,
          EextensionsType.multiDatastream,
          EextensionsType.lora,
        ].some((r) => _DB[entity].essai.includes(r))
    ),
    async (entity: string) => {
      const cols = await createColumnsList(ctx, entity);
      const temp = await executeSql(ctx._config.name, `select ${cols.join(",")} from "${_DB[entity].table}" LIMIT 200`);
      await addToFile(workbook, entity, temp);
    }
  );
  ctx.response.attachment(`${ctx._config.name}.xlsx`);
  ctx.status = 200;
  await workbook.xlsx.write(ctx.res);
  ctx.res.end();
};

export const importOnglet = async (
  workbook: Excel.Workbook,
  table: string,
  ctx: koa.Context
) => {
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
        Object.keys(names).forEach((name: string, index: number) => {
          if (!["", "id", "insertId"].includes(names[name])) {
            temp[names[name]] = row.getCell(+name).value;
          }
        });
        let ret = undefined;
        try {
          ret = await executeSql(ctx._config.name, `INSERT INTO "${_DB[table].table}" ${createInsertValues(temp, _DB[table].name)}`);
          console.log(ret);
          // row.getCell(0).value = ret[0];
        } catch (error: any) {
          if (error.code === "23505") {
            ret = await executeSql(ctx._config.name, `SELECT "id" FROM ${_DB[table].table}" WHERE "name" = '${temp["name"]}' LIMIT 1`);
            console.log(row.getCell(1).value);
            row.getCell(1).value = +ret["id"] + 100;
            console.log(
              row.getCell(1).value +
                ":" +
                row.getCell(2).value +
                ":" +
                row.getCell(3).value +
                ":" +
                row.getCell(4).value +
                ":" +
                row.getCell(5).value +
                ":"
            );
          }
        }
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
