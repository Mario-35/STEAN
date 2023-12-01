/**
 * CreateObservations entity.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import koa from "koa";
import { Common } from "./common";
import { Logs } from "../../logger";
import { IcsvColumn, IcsvFile, IreturnResult, IstreamInfos } from "../../types";
import { executeSql, executeSqlValues, getStreamInfos, streamCsvFileInPostgreSql } from "../helpers";
import { asyncForEach } from "../../helpers";
import { errors, msg } from "../../messages/";
import { EdatesType, EextensionsType } from "../../enums";
import util from "util";
import { _OK } from "../../constants";

// TODOCLEAN

export class CreateObservations extends Common {
  public indexResult = -1;
  constructor(ctx: koa.Context) {
    super(ctx);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // get stream ID
  dateToDateWithTimeZone(value: string) {
    //Create Date object from ISO string
    const date = new Date(value);
    //Get ms for date
    const time = date.getTime();
    //Check if timezoneOffset is positive or negative
    if (date.getTimezoneOffset() <= 0) {
      //Convert timezoneOffset to hours and add to Date value in milliseconds
      const final = time + Math.abs(date.getTimezoneOffset() * 60000);
      //Convert from milliseconds to date and convert date back to ISO string
      return new Date(final).toISOString();
    } else {
      const final = time + -Math.abs(date.getTimezoneOffset() * 60000);
      return new Date(final).toISOString();
    }
  }

  createListColumnsValues(
    type: "COLUMNS" | "VALUES",
    input: string[]
  ): string[] {
    const res: string[] = [];
    const separateur = type === "COLUMNS" ? '"' : "'";
    input.forEach((elem: string, index: number) => {
      switch (elem) {
        case "result":
          this.indexResult = index + 1;
          break;
        case "FeatureOfInterest/id":
          elem = "featureofinterest_id";
          break;
      }
      res.push(
        isNaN(+elem)
          ? Array.isArray(elem)
            ? `'{"value": [${elem}]}'`
            : typeof elem === "string"
            ? elem.endsWith("Z")
              ? `TO_TIMESTAMP('${this.dateToDateWithTimeZone(elem)}', '${
                  EdatesType.dateWithOutTimeZone
                }')::TIMESTAMP`
              : `${separateur}${elem}${separateur}`
            : `${separateur}{${elem}}${separateur}`
          : index === this.indexResult && type === "VALUES"
          ? this.ctx._config.extensions.includes(EextensionsType.numeric)
            ? elem
            : `'{"value": ${elem}}'`
          : elem
      );
    });
    return res;
  }

  async getAll(): Promise<IreturnResult | undefined> {
    this.ctx.throw(400, { code: 400 });
  }

  async getSingle( idInput: bigint | string ): Promise<IreturnResult | undefined> {
    Logs.whereIam(idInput);
    this.ctx.throw(400, { code: 400 });
  }

  async add(dataInput: JSON): Promise<IreturnResult | undefined> {
    Logs.whereIam();
    const returnValue: string[] = [];
    let total = 0;
    // verify is there JSON data
    if (this.ctx._datas) {
      const datasJson = JSON.parse(this.ctx._datas["datas"]);
      if (!datasJson["columns"])
        this.ctx.throw(404, { code: 404, detail: errors.noColumn });
      const myColumns: IcsvColumn[] = [];
      const streamInfos: IstreamInfos[] = [];
      await asyncForEach(
        Object.keys(datasJson["columns"]),
        async (key: string) => {
          const tempStreamInfos = await getStreamInfos(
            this.ctx._config.name,
            datasJson["columns"][key] as JSON
          );
          if (tempStreamInfos) {
            streamInfos.push(tempStreamInfos);
            myColumns.push({
              column: key,
              stream: tempStreamInfos,
            });
          } else
            this.ctx.throw(
              404,
              msg(
                errors.noValidStream,
                util.inspect(datasJson["columns"][key], {
                  showHidden: false,
                  depth: null,
                  colors: false,
                })
              )
            );
        }
      );

      const paramsFile: IcsvFile = {
        tempTable: `temp${Date.now().toString()}`,
        filename: this.ctx._datas["file"],
        columns: myColumns,
        header:
          datasJson["header"] && datasJson["header"] == true ? ", HEADER" : "",
        stream: streamInfos,
      };
      await streamCsvFileInPostgreSql(this.ctx, this.ctx._config.name, paramsFile)
        .then(async (res) => {
          Logs.debug("streamCsvFileInPostgreSql", _OK);
            Logs.result("query", res);
            // Execute query
            if (res) await executeSql(this.ctx._config.name, res).then(async (returnResult: object) => {
              Logs.debug("SQL Executing", _OK);
              returnValue.push(
                `Add ${
                  returnResult && returnResult["inserted"]
                    ? +returnResult["inserted"]
                    : -1
                } observations from ${
                  paramsFile.filename.split("/").reverse()[0]
                }`
              );
              total =
                returnResult && returnResult["total"]
                  ? +returnResult["total"]
                  : -1;
            });
        })
        .catch((error: Error) => {
          Logs.error(error);
        });
    } else {
      /// classic Create
      const dataStreamId = await getStreamInfos(this.ctx._config.name, dataInput);
      if (!dataStreamId)
        this.ctx.throw(404, { code: 404, detail: errors.noStream });
      else {
        await asyncForEach(dataInput["dataArray"], async (elem: string[]) => {
          const keys = [`"${dataStreamId.type?.toLowerCase()}_id"`].concat(
            this.createListColumnsValues(
              "COLUMNS",
              dataInput["components"]
            )
          );
          const values = this.createListColumnsValues("VALUES", [
            String(dataStreamId.id),
            ...elem,
          ]);
          await executeSqlValues(this.ctx._config.name, `INSERT INTO "observation" (${keys}) VALUES (${values}) RETURNING id`)
            .then((res: object) => {
              returnValue.push(
                this.linkBase.replace("Create", "") +
                  "(" +
                  res[0]+
                  ")"
              );
              total += 1;
            })
            .catch(async (error) => {
              if (error.code === "23505") {
                returnValue.push(`Duplicate (${elem})`);
                if (
                  dataInput["duplicate"] &&
                  dataInput["duplicate"].toUpperCase() === "DELETE"
                ) {
                  await executeSqlValues(this.ctx._config.name, `delete FROM "observation" WHERE 1=1 ` +
                        keys
                          .map((e, i) => `AND ${e} = ${values[i]}`)
                          .join(" ") +
                        ` RETURNING id`
                    )
                    .then((res: object) => {
                      returnValue.push(`delete id ==> ${res[0]}`);
                      total += 1;
                    })
                    .catch((error) => {
                      Logs.writeErrorInFile(undefined, error);
                    });
                }
              } else this.ctx.throw(400, { code: 400, detail: error });
            });
        });
        return this.createReturnResult({
          total: total,
          body: returnValue,
        });
      }
    }
    if (returnValue) {
      return this.createReturnResult({
        total: total,
        body: returnValue,
      });
    }
  }

  async update( idInput: bigint | string, dataInput: object | undefined ): Promise<IreturnResult | undefined> {
    Logs.whereIam(idInput || dataInput);
    this.ctx.throw(400, { code: 400 });
  }

  async delete(idInput: bigint | string): Promise<IreturnResult | undefined> {
    Logs.whereIam(idInput);
    this.ctx.throw(400, { code: 400 });
  }
}
