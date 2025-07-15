"use strict";
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
const setup = async (req, res) => {
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
        const sqlConnection = await sqlPool.connect();
        console.log('External database connection successful.');
        sqlConnection.close();
        // 2. Connect to Internal DB and Save Settings
        const client = await database_service_1.default.connect();
        try {
            console.log('Connecting to internal database to save settings...');
            const initSql = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../database/init.sql'), 'utf8');
            await client.query(initSql);
            console.log('Internal database initialization script executed successfully.');
            await client.query('BEGIN');
            // Clear any previous, incomplete setup data
            await client.query('DELETE FROM settings');
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPin = await bcrypt_1.default.hash(adminPin, salt);
            await client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['admin_pin', hashedPin]);
            await client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['external_db_type', dbType]);
            await client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['external_db_config', JSON.stringify(dbConfig)]);
            await client.query("INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)", ['setup_complete', 'true']);
            await client.query('COMMIT');
            console.log('Configuration saved and setup complete.');
            res.status(201).json({ message: 'Setup completed successfully.' });
        }
        catch (error) {
            console.error('Setup failed during internal database operation:', error);
            await client.query('ROLLBACK');
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
};
exports.setup = setup;
const resetSetup = async (req, res) => {
    console.log('Received request to reset setup');
    try {
        const client = await database_service_1.default.connect();
        try {
            await client.query('BEGIN');
            // This will delete all settings, effectively resetting the application
            await client.query('DELETE FROM settings');
            console.log('All settings have been deleted.');
            await client.query('COMMIT');
            res.status(200).json({ message: 'Setup has been reset successfully.' });
        }
        catch (error) {
            await client.query('ROLLBACK');
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
};
exports.resetSetup = resetSetup;
