import { dbTest } from "../dbTest";

export const executeQuery = async (sql: string, show?:boolean): Promise<object> => {
    if (show) {
        console.log("=========================== executeQuery ===========================");
        console.log(sql);
    }
    
    return new Promise(async function (resolve, reject) {
        await dbTest.unsafe(sql).then((res: object) => {   
            if (show) console.log(res[0]);           
                resolve(res[0]);
            }).catch((err: Error) => {                
                reject(err);
            });
    });
};


export const last = (table: string, all?: boolean) => `SELECT ${all ? '*' : 'id'} FROM "${table}" ORDER BY id desc LIMIT 1`;
export const count = (table: string) => `SELECT count(*)::int FROM "${table}"`;