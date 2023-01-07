import pg from "pg"
import { message } from "../../logger"
import { IDbConnection } from "../../types"

export async function pgwait(options: IDbConnection): Promise<boolean> {
    const pool = new pg.Pool({... options, database: "postgres" });
    let passage = 1;
    const timeStamp = (): string => {
        const d = new Date()
        return d.toLocaleTimeString()
    }
    
    const printStatusMsg = (status: string): void => {
        message(false, "RESULT", `Databse PostgreSQL ${status}`, timeStamp());
    }

    const connect = async (): Promise<boolean> => {
            try {
                await pool.query('SELECT 1')
                printStatusMsg('Online')
                await pool.end();
                return true;
            }   
            catch (e) {
                if (passage === 1) printStatusMsg('Offline')
                return false;
            }
    }
    let testConnection = false;
    let end = Number(Date.now()) + options.retry  * 1000;
    do {        
        testConnection = await connect();
        passage += passage;
    } while (testConnection === false && Number(Date.now()) < end);
    return testConnection;
}