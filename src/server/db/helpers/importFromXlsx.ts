import Excel from "exceljs";
import path from "path";
import { createInsertValues, getEntityName } from ".";
import { serverConfig } from "../../configuration";
import { Logs } from "../../logger";
import { IKeyString } from "../../types";
import { _DB } from "../constants";

const getOngletConfig = async ( workbook: Excel.Workbook) => {
  const result: IKeyString = {};
  const worksheet = workbook.getWorksheet("Config");
  worksheet.eachRow(
    { includeEmpty: true },
    async (row: Excel.Row) => {
      result[row.values[1]] = row.values[2];      
    }
  );  
  return serverConfig.addConfig(result);
};

const formatValueCell = (input: Excel.CellValue): string => {
  if (!input) return "null";
  if (input[0] === "[") return `${input}`;  
  return `"${input}"`;
};

const importOnglet = async ( workbook: Excel.Workbook, table: string, configName: string ) => {
  let names:string[] = [];
  const worksheet = workbook.getWorksheet(table);
  worksheet.eachRow(
    { includeEmpty: true },
    async (row: Excel.Row, rowNumber: number) => {
      const temp: object = {};
      if (rowNumber === 1) {
        let temp = row.values.toString().split(",");        
        temp = Object.assign({}, row.values.toString().split(","));
        names = Object.values(temp).filter(e => e !== "");
      } else if (rowNumber > 1) {        
        names.forEach((name: string, index: number) => {
          if (!["", "id"].includes(name) && name[0] != "_") {
            if (name.includes("-")) {
              const tempNames = name.split("-");              
              temp[tempNames[0]] = `${temp[tempNames[0]] ? `${temp[tempNames[0]].slice(0, -1)},` : '{'} "${tempNames[1]}": ${formatValueCell(row.getCell(index+1).value)}}`;
            } if (name.endsWith("_id")) {              
              const tempSplit = name.split("_");
              const entityName = getEntityName(tempSplit[0]);
              if (entityName) {                
                const tempName = getNameFromId(workbook, entityName, +`${row.getCell(index+1).value}`);
                if (tempName) temp[name] = `(SELECT "id" FROM "${_DB[entityName].table}" WHERE "name" = '${tempName}')`;
              }              
            } else temp[name] = row.getCell(index+1).value;
          }
        });
        const query = `INSERT INTO "${_DB[table].table}" ${createInsertValues(temp, _DB[table].name)} RETURNING *`;
        await serverConfig.db(configName).unsafe(query) .catch(async (error: Error) => { Logs.errorQuery(query, error); });
      }
    }
  );
};

export const importFromXlsx = async () => {
  const filePath = path.resolve(__dirname, "mario.xlsx");
  const workbook = new Excel.Workbook();
  workbook.xlsx.readFile(filePath).then(async () => {    
    const create = await getOngletConfig(workbook);
    if (create && create["name"]) {
      const configName = create["name"];
      importOnglet(workbook, _DB.Sensors.name, configName);
      importOnglet(workbook, _DB.FeaturesOfInterest.name, configName);
      importOnglet(workbook, _DB.Things.name, configName);
      importOnglet(workbook, _DB.Locations.name, configName);
      importOnglet(workbook, _DB.ObservedProperties.name, configName);
      importOnglet(workbook, _DB.Datastreams.name, configName);
      importOnglet(workbook, _DB.MultiDatastreams.name, configName);
      importOnglet(workbook, _DB.ThingsLocations.name, configName);
      importOnglet(workbook, _DB.Decoders.name, configName);
      importOnglet(workbook, _DB.Loras.name, configName);
      // await executeSql(configName, `update datastream set "_phenomenonTimeStart" = (SELECT min("observation"."phenomenonTime") from "observation" where "observation"."datastream_id" = "datastream"."id"), "_phenomenonTimeEnd" = (SELECT max("observation"."phenomenonTime") from "observation" where "observation"."datastream_id" = "datastream"."id"), "_resultTimeStart" = (SELECT min("observation"."resultTime") from "observation" where "observation"."datastream_id" = "datastream"."id"), "_resultTimeEnd" = (SELECT max("observation"."resultTime") from "observation" where "observation"."datastream_id" = "datastream"."id")`, true);
      // await executeSql(configName, `"update multidatastream set "_phenomenonTimeStart" = (SELECT min("observation"."phenomenonTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"), "_phenomenonTimeEnd" = (SELECT max("observation"."phenomenonTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"), "_resultTimeStart" = (SELECT min("observation"."resultTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id"), "_resultTimeEnd" = (SELECT max("observation"."resultTime") from "observation" where "observation"."multidatastream_id" = "multidatastream"."id")`, true);
    }
  });
};


const getNameFromId = ( workbook: Excel.Workbook, table: string, idSearch: number | string ): string | undefined => {
  if (idSearch === "string") idSearch = +idSearch;
  const worksheet = workbook.getWorksheet(table);
  let result: string | undefined = undefined;
  let nb: number | undefined = undefined;
  let nbName: number | undefined = undefined;
  worksheet.eachRow(
    { includeEmpty: true },
     (row: Excel.Row, rowNumber: number) => {
      const tempSplit = row.values.toString().split(","); 
      if (rowNumber === 1) {
        nb = tempSplit.indexOf("id");
        nbName = tempSplit.indexOf("name");       
      } else if (rowNumber > 1 && nb && nbName) {       
        // const moi = row.getCell(nb).value; 
        if (+idSearch === +tempSplit[nb]) {    
          result = tempSplit[nbName];
          return;          
        }
      }
    });
    return result;
};