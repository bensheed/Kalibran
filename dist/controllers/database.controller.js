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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDatabase = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
const pg_1 = require("pg");
const setDatabase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dbHost, dbPort, dbUser, dbPassword, dbName } = req.body;
    if (!dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
        return res.status(400).json({ message: 'All database fields are required.' });
    }
    const dbConfig = {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
    };
    // Test the database connection
    const testPool = new pg_1.Pool(dbConfig);
    try {
        const testClient = yield testPool.connect();
        testClient.release();
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
        return res.status(400).json({ message: 'Failed to connect to the database. Please check your credentials.' });
    }
    finally {
        yield testPool.end();
    }
    try {
        const client = yield database_service_1.default.connect();
        try {
            yield client.query('BEGIN');
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1", [JSON.stringify(dbConfig)]);
            yield client.query('COMMIT');
            res.status(201).json({ message: 'Database configured successfully.' });
        }
        catch (error) {
            yield client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Failed to set database config:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
});
exports.setDatabase = setDatabase;
