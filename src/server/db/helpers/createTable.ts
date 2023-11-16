/**
 * createTable.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { serverConfig } from "../../configuration";
import { _OK } from "../../constants";
import { Logs } from "../../logger";
import { Ientity, IKeyString } from "../../types";

export const createTable = async ( configName: string, tableEntity: Ientity, doAfter: string | undefined ): Promise<IKeyString> => {
  if (!tableEntity) return {};
Logs.head(`CreateTable [${tableEntity.table}] for ${configName}`);
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
    await serverConfig.db(configName).unsafe(`CREATE TABLE "${tableEntity.table}" (${insertion});`)
        .then(() => _OK)
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
    await serverConfig.db(configName).unsafe(tabTemp.join(";"))
        .then(() => _OK)
        .catch((error: Error) => error.message);

  // CREATE CONSTRAINTS
  if (tableEntity.constraints && tabConstraints.length > 0)
    returnValue[`${tab()}Create constraints for ${tableEntity.table}`] =
      await serverConfig.db(configName).unsafe(tabConstraints.join(" "))
        .then(() => _OK)
        .catch((error: Error) => error.message);

  // CREATE SOMETHING AFTER
  if (tableEntity.after) {
    if (tableEntity.after.toUpperCase().startsWith("INSERT"))
      returnValue[`${tab()}Something to do after for ${tableEntity.table}`] =
      await serverConfig.db(configName).unsafe(tableEntity.after)
          .then(() => _OK)
          .catch((error: Error) => {
            Logs.error(error);
            return error.message;
          });
  }

  // CREATE SOMETHING AFTER (migration)
  if (doAfter) {
    returnValue[`${tab()} doAfter ${tableEntity.table}`] = await serverConfig.db(configName).unsafe(doAfter)
      .then(() => _OK)
      .catch((error: Error) => error.message);
  }

  return returnValue;
};
