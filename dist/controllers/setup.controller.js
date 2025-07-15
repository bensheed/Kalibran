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
exports.resetSetup = exports.setup = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mssql_1 = __importDefault(require("mssql"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const setup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received setup request:', req.body);
    const { adminPin, dbType, dbHost, dbPort, dbUser, dbPassword, dbName } = req.body;
    // Basic validation
    if (!adminPin || typeof adminPin !== 'string' || adminPin.length < 4) {
        console.log('Validation failed: Invalid PIN');
        return res.status(400).json({ message: 'A PIN of at least 4 digits is required.' });
    }
    if (!dbType || !dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
        console.log('Validation failed: Missing database fields');
        return res.status(400).json({ message: 'All database fields are required.' });
    }
    const dbConfig = {
        user: dbUser,
        password: dbPassword,
        server: dbHost,
        port: dbPort,
        database: dbName,
        options: {
            encrypt: true, // Use this if you're on Azure
            trustServerCertificate: true // Change to true for local dev / self-signed certs
        }
    };
    try {
        // 1. Test External DB Connection
        console.log('Connecting to external database to test connection...');
        const sqlPool = new mssql_1.default.ConnectionPool(dbConfig);
        const sqlConnection = yield sqlPool.connect();
        console.log('External database connection successful.');
        sqlConnection.close();
        // 2. Connect to Internal DB and Save Settings
        const client = yield database_service_1.default.connect();
        try {
            console.log('Connecting to internal database to save settings...');
            const initSql = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../database/init.sql'), 'utf8');
            yield client.query(initSql);
            console.log('Internal database initialization script executed successfully.');
            yield client.query('BEGIN');
            // Clear any previous, incomplete setup data
            yield client.query('DELETE FROM settings');
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPin = yield bcrypt_1.default.hash(adminPin, salt);
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['admin_pin', hashedPin]);
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['external_db_type', dbType]);
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['external_db_config', JSON.stringify(dbConfig)]);
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['setup_complete', 'true']);
            yield client.query('COMMIT');
            console.log('Configuration saved and setup complete.');
            res.status(201).json({ message: 'Setup completed successfully.' });
        }
        catch (error) {
            console.error('Setup failed during internal database operation:', error);
            yield client.query('ROLLBACK');
            throw error; // Re-throw to be caught by the outer catch block
        }
        finally {
            if (client) {
                client.release();
            }
        }
    }
    catch (error) {
        console.error('Setup failed:', error);
        if (error.code === 'ELOGIN') {
            return res.status(401).json({ message: `Authentication failed for user '${dbUser}'. Please check the username and password.` });
        }
        if (error.code === 'ENOTFOUND') {
            return res.status(404).json({ message: `Server not found at '${dbHost}'. Please check the host address.` });
        }
        if (error.code === 'ECONNREFUSED') {
            return res.status(400).json({ message: `Connection refused on port ${dbPort}. Please check the port number.` });
        }
        return res.status(500).json({ message: error.message || 'An unexpected error occurred during setup.' });
    }
});
exports.setup = setup;
const resetSetup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received request to reset setup');
    try {
        const client = yield database_service_1.default.connect();
        try {
            yield client.query('BEGIN');
            // This will delete all settings, effectively resetting the application
            yield client.query('DELETE FROM settings');
            console.log('All settings have been deleted.');
            yield client.query('COMMIT');
            res.status(200).json({ message: 'Setup has been reset successfully.' });
        }
        catch (error) {
            yield client.query('ROLLBACK');
            throw error;
        }
        finally {
            if (client) {
                client.release();
            }
        }
    }
    catch (error) {
        console.error('Failed to reset setup:', error);
        res.status(500).json({ message: 'An internal server error occurred during reset.' });
    }
});
exports.resetSetup = resetSetup;
