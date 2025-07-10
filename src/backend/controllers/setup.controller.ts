import { Request, Response } from 'express';
import pool from '../services/database.service';
import bcrypt from 'bcrypt';
import sql from 'mssql';
import fs from 'fs';
import path from 'path';

export const setup = async (req: Request, res: Response) => {
    console.log('Received setup request:', req.body);
    const { adminPin, dbType, dbHost, dbPort, dbUser, dbPassword, dbName } = req.body;

    // Basic validation
    if (!adminPin || typeof adminPin !== 'string' || !/^\d{4}$/.test(adminPin)) {
        console.log('Validation failed: Invalid PIN');
        return res.status(400).json({ message: 'A 4-digit PIN is required.' });
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
        await sql.connect(dbConfig);
        console.log('External database connection successful.');
        await sql.close();

        // 2. Connect to Internal DB and Save Settings
        const client = await pool.connect();
        try {
            console.log('Connecting to internal database to save settings...');
            const initSql = fs.readFileSync(path.join(__dirname, '../../../database/init.sql'), 'utf8');
            await client.query(initSql);
            console.log('Internal database initialization script executed successfully.');

            await client.query('BEGIN');

            // Clear any previous, incomplete setup data
            await client.query('DELETE FROM settings');

            const salt = await bcrypt.genSalt(10);
            const hashedPin = await bcrypt.hash(adminPin, salt);
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pin', $1)",
                [hashedPin]
            );

            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_type', $1)",
                [dbType]
            );

            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1)",
                [JSON.stringify(dbConfig)]
            );

            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('setup_complete', 'true')"
            );

            await client.query('COMMIT');
            console.log('Configuration saved and setup complete.');

            res.status(201).json({ message: 'Setup completed successfully.' });

        } catch (error: any) {
            console.error('Setup failed during internal database operation:', error);
            await client.query('ROLLBACK');
            throw error; // Re-throw to be caught by the outer catch block
        } finally {
            client.release();
        }

    } catch (error: any) {
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
        return res.status(500).json({ message: 'Failed to connect to the external database. Please check your credentials and network connection.' });
    }
};

export const resetSetup = async (req: Request, res: Response) => {
    console.log('Received request to reset setup');
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // This will delete all settings, effectively resetting the application
            await client.query('DELETE FROM settings');
            console.log('All settings have been deleted.');
            await client.query('COMMIT');
            res.status(200).json({ message: 'Setup has been reset successfully.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to reset setup:', error);
        res.status(500).json({ message: 'An internal server error occurred during reset.' });
    }
};

