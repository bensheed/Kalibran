"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProCalData = void 0;
const mssql_1 = __importDefault(require("mssql"));
const database_service_1 = __importDefault(require("./database.service"));
// Configuration for the external SQL Server
const sqlConfig = {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_SERVER || 'localhost',
    database: process.env.MSSQL_DATABASE,
    options: {
        encrypt: process.env.MSSQL_ENCRYPT === 'true', // Use true for Azure SQL Database, or if you have an SSL certificate
        trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === 'true', // Change to true for local dev / self-signed certs
    },
};
/**
 * Fetches data from the external ProCal database, joins 'Calibrations' and 'Instruments',
 * and syncs the latest job for each instrument into the local PostgreSQL database.
 */
const syncProCalData = async () => {
    let mssqlPool = null;
    try {
        mssqlPool = await mssql_1.default.connect(sqlConfig);
        const result = await mssqlPool.request().query `
            WITH LatestCalibrations AS (
                SELECT 
                    i.*, 
                    c.Job_no,
                    ROW_NUMBER() OVER(PARTITION BY i.Inst_ID ORDER BY c.Job_no DESC) as rn
                FROM 
                    Instruments i
                JOIN 
                    Calibrations c ON i.Inst_ID = c.Inst_ID
            )
            SELECT *
            FROM LatestCalibrations
            WHERE rn = 1;
        `;
        const proCalData = result.recordset;
        if (proCalData.length === 0) {
            console.log('No new data to sync from ProCal.');
            return;
        }
        // Start a transaction with the PostgreSQL pool
        const client = await database_service_1.default.connect();
        try {
            await client.query('BEGIN');
            // Clear the existing raw data
            await client.query('TRUNCATE TABLE raw_sync_data RESTART IDENTITY');
            // Insert new data
            for (const row of proCalData) {
                const { Inst_ID, Job_no, ...rest } = row;
                const query = {
                    text: 'INSERT INTO raw_sync_data(inst_id, job_no, data) VALUES($1, $2, $3)',
                    values: [Inst_ID, Job_no, rest],
                };
                await client.query(query);
            }
            await client.query('COMMIT');
            console.log(`Successfully synced ${proCalData.length} records from ProCal.`);
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e; // Re-throw the error after rolling back
        }
        finally {
            client.release();
        }
    }
    catch (err) {
        console.error('Error during ProCal data sync:', err);
        throw new Error('Failed to sync data from ProCal.');
    }
    finally {
        if (mssqlPool) {
            await mssqlPool.close();
        }
    }
};
exports.syncProCalData = syncProCalData;
