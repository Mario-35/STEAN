/**
 * createTable.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { executeSql } from ".";
import { serverConfig } from "../../configuration";
import { Logs } from "../../logger";
import { Ientity, IKeyString } from "../../types";

export const createTable = async (
  configName: string,
  tableEntity: Ientity,
  doAfter: string | undefined
): Promise<IKeyString> => {
  if (!tableEntity) return {};

  const space = 5;
  const tab = () => " ".repeat(space);
  const tabInsertion: string[] = [];
  const tabConstraints: string[] = [];
  const returnValue: IKeyString = {};

  let insertion = "";
  if (!serverConfig.db(configName)) {
    Logs.error("connection Error");
    return { error: "connection Error" };
  }

  // create postgis
   
  returnValue[`${tab()}Create postgis`] = await executeSql(configName,"CREATE EXTENSION IF NOT EXISTS postgis;")
    .then(() => "✔")
    .catch((error: Error) => error.message);

  returnValue[`${tab()}Create tablefunc`] = await executeSql(configName,"CREATE EXTENSION IF NOT EXISTS tablefunc;")
    .then(() => "✔")
    .catch((error: Error) => error.message);

  Object.keys(tableEntity.columns).forEach((column) => {
    if (tableEntity.columns[column].create.trim() != "")
      tabInsertion.push(`"${column}" ${tableEntity.columns[column].create}`);
  });
  insertion = `${tabInsertion.join(", ")}`;

  if (tableEntity.constraints) {
    Object.keys(tableEntity.constraints).forEach((constraint) => {
      if (tableEntity.constraints)
        tabConstraints.push(
          `ALTER TABLE ONLY "${tableEntity.table}" ADD CONSTRAINT "${constraint}" ${tableEntity.constraints[constraint]};`
        );
    });
  }

  if (tableEntity.table.trim() != "")
    returnValue[String(`Create table ${tableEntity.table}`)] =
      await executeSql(configName,`CREATE TABLE "${tableEntity.table}" (${insertion});`)
        .then(() => "✔")
        .catch((error: Error) => error.message);

  const indexes = tableEntity.indexes;
  const tabTemp: string[] = [];

  // CREATE INDEXES
  if (indexes)
    Object.keys(indexes).forEach((index) => {
      tabTemp.push(`CREATE INDEX "${index}" ${indexes[index]}`);
    });

  if (tabTemp.length > 0)
    returnValue[`${tab()}Create indexes for ${tableEntity.name}`] =
      await executeSql(configName,tabTemp.join(";"))
        .then(() => "✔")
        .catch((error: Error) => error.message);

  // CREATE CONSTRAINTS
  if (tableEntity.constraints && tabConstraints.length > 0)
    returnValue[`${tab()}Create constraints for ${tableEntity.table}`] =
      await executeSql(configName,tabConstraints.join(" "))
        .then(() => "✔")
        .catch((error: Error) => error.message);

  // CREATE SOMETHING AFTER
  if (tableEntity.after) {
    if (tableEntity.after.toUpperCase().startsWith("INSERT"))
      returnValue[`${tab()}Something to do after for ${tableEntity.table}`] =
        await executeSql(configName,tableEntity.after)
          .then(() => "✔")
          .catch((error: Error) => {
            console.log(error);
            return error.message;
          });
  }

  // CREATE SOMETHING AFTER (migration)
  if (doAfter) {
    returnValue[`${tab()} doAfter ${tableEntity.table}`] = await executeSql(configName,doAfter)
      .then(() => "✔")
      .catch((error: Error) => error.message);
  }

  return returnValue;
};
