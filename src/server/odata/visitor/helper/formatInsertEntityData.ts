/**
 * formatInsertEntityData.
 *
 * @copyright 2022-present Inrae
 * @author mario.adam@inrae.fr
 *
 */
import { PgVisitor } from "../..";
import { models } from "../../../models";
import { apiAccess } from "../../../db/dataAccess";
import * as entities from "../../../db/entities";

/**
 * 
 * @param entity entity name
 * @param datas datas object
 * @param main PgVisitor
 * @returns formated postgresSQL Insert
 */
export function formatInsertEntityData(entity: string, datas: object, main: PgVisitor): object {
    const goodEntity = models.getEntityName(main.ctx.config, entity);
    if (goodEntity && goodEntity in entities) {
        try {
            const objectEntity = new apiAccess(main.ctx, entity);
            const tempDatas = objectEntity.formatDataInput(datas);
            if (tempDatas) return tempDatas;        
        } catch (error) {
            console.log(error);            
        }
    }
    return datas;
} 