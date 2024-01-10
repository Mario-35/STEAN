/**
 * getColumnNameOrAlias.
 *
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

import { IconfigFile, Ientity, IcolumnOption } from "../../types";

export const getColumnNameOrAlias = (config: IconfigFile, entity: Ientity, column : string, options: IcolumnOption) => {  
  const result = entity 
          && column != "" 
          && entity.columns[column] 
            ? entity.columns[column].columnAlias(config, options.test ? {...options.test, ...{"as": options.as}} : {"as": options.as}) 
            : undefined;
  return result ? `${options.table === true && result && result[0] === '"' ? `"${entity.table}".${result}` : result}` : undefined;        
}; 


