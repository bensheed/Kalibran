"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
const syncProCalData = () => __awaiter(void 0, void 0, void 0, function* () {
    let mssqlPool = null;
    try {
        mssqlPool = yield mssql_1.default.connect(sqlConfig);
        const result = yield mssqlPool.request().query `
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
        const client = yield database_service_1.default.connect();
        try {
            yield client.query('BEGIN');
            // Clear the existing raw data
            yield client.query('TRUNCATE TABLE raw_sync_data RESTART IDENTITY');
            // Insert new data
            for (const row of proCalData) {
                const { Inst_ID, Job_no } = row, rest = __rest(row, ["Inst_ID", "Job_no"]);
                const query = {
                    text: 'INSERT INTO raw_sync_data(inst_id, job_no, data) VALUES($1, $2, $3)',
                    values: [Inst_ID, Job_no, rest],
                };
                yield client.query(query);
            }
            yield client.query('COMMIT');
            console.log(`Successfully synced ${proCalData.length} records from ProCal.`);
        }
        catch (e) {
            yield client.query('ROLLBACK');
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
            yield mssqlPool.close();
        }
    }
});
exports.syncProCalData = syncProCalData;
