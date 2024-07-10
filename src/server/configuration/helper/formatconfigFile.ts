/**
 * formatconfigFile
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
// onsole.log("!----------------------------------- formatconfigFile -----------------------------------!");

import { ADMIN } from "../../constants";
import util from "util";
import { EVersion } from "../../enums";
import { unikeList, unique } from "../../helpers";
import { errors } from "../../messages";
import { IconfigFile, keyobj, typeExtensions, typeOptions } from "../../types";
import { getModelVersion } from "../../models/helpers";

export function formatconfigFile(name: string, input: object): IconfigFile {
    const options: typeof typeOptions = input["options"as keyobj]
    ? unique([... String(input["options"as keyobj]).split(",")]) as typeof typeOptions 
    : [];

    const extensions: typeof typeExtensions = input["extensions"as keyobj]
      ? unique(["base", ... String(input["extensions"as keyobj]).split(",")]) as typeof typeExtensions 
      : ["base"];

    if (input["extensions"as keyobj]["users"]) extensions.includes("users");
    const version = name === ADMIN ? EVersion.v1_1  : String(input["apiVersion" as keyobj]).trim();
    const returnValue: IconfigFile = {
      name: name,
      port: name === ADMIN
          ? input["port" as keyobj] || 8029
          : undefined,
      pg: {
        _ready: undefined,
        host: input["pg" as keyobj] && input["pg" as keyobj]["host" as keyobj] ? String(input["pg" as keyobj]["host" as keyobj]) : `ERROR`,
        port: input["pg" as keyobj] && input["pg" as keyobj]["port"] ? input["pg" as keyobj]["port"] : 5432,
        user: input["pg" as keyobj] && input["pg" as keyobj]["user"] ? input["pg" as keyobj]["user"] : `ERROR`,
        password: input["pg" as keyobj] && input["pg" as keyobj]["password"] ? input["pg" as keyobj]["password"] : `ERROR`,
        database: name && name === "test" ? "test" : input["pg" as keyobj] && input["pg" as keyobj]["database"] ? input["pg" as keyobj]["database"] : `ERROR`,
        retry: input["retry" as keyobj] ? +input["retry" as keyobj] : 2,
        tunnel: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] ?  {
          sshConnection: {
            host: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["host"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["host"] : `ERROR`,
            username: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["username"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["username"] : `ERROR`,
            port: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["port"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["port"] : 22,
            password: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["sshConnection"]["password"] ? input["pg" as keyobj]["tunnel"]["sshConnection"]["password"] : `ERROR`,
          },
          forwardConnection: {
            srcAddr: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcAddr"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcAddr"] : `ERROR`,
            srcPort: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcPort"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["srcPort"] : 22,
            dstAddr: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstAddr"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstAddr"] : `ERROR`,
            dstPort: input["pg" as keyobj] && input["pg" as keyobj]["tunnel"] &&  input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstPort"] ? input["pg" as keyobj]["tunnel"]["forwardConnection"]["dstPort"] : 22
          }
        } : undefined 
      },
      apiVersion: getModelVersion(version),
      date_format: input["date_format" as keyobj] || "DD/MM/YYYY hh:mi:ss",
      webSite: input["webSite" as keyobj] || "no web site",
      nb_page: input["nb_page" as keyobj] ? +input["nb_page" as keyobj] : 200,
      alias: input["alias" as keyobj] ? unikeList(String(input["alias" as keyobj]).split(",")) : [],
      extensions: extensions,
      options: options,
      _connection: undefined,
    };    
    if (Object.values(returnValue).includes("ERROR"))
      throw new TypeError(
        `${errors.inConfigFile} [${util.inspect(returnValue, {
          showHidden: false,
          depth: null,
        })}]`
      );
    return returnValue;
  }