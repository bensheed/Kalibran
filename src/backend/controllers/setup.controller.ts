import { Request, Response } from 'express';
import pool from '../services/database.service';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
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
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
    };

    const pool = new Pool(dbConfig);
    let client: any;

    try {
        // 1. Test Connection and Initialize DB
        console.log('Connecting to database to test connection and initialize...');
        client = await pool.connect();
        console.log('Database connection successful.');

        const initSql = fs.readFileSync(path.join(__dirname, '../../../database/init.sql'), 'utf8');
        await client.query(initSql);
        console.log('Database initialization script executed successfully.');

        // 2. Save Settings
        console.log('Saving configuration settings...');
        await client.query('BEGIN');

        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(adminPin, salt);
        await client.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pin', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
            [hashedPin]
        );

        await client.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_type', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
            [dbType]
        );

        await client.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
            [JSON.stringify(dbConfig)]
        );

        await client.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES ('setup_complete', 'true') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true'"
        );

        await client.query('COMMIT');
        console.log('Configuration saved and setup complete.');

        res.status(201).json({ message: 'Setup completed successfully.' });

    } catch (error: any) {
        console.error('Setup failed during database operation:', error);
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rbError) {
                console.error('Rollback failed:', rbError);
            }
        }
        // Provide a more specific error message if possible
        if (error.code === '28P01') { // PostgreSQL authentication error
            return res.status(400).json({ message: 'Authentication failed. Please check your username and password.' });
        }
        if (error.code === '3D000') { // PostgreSQL database does not exist error
            return res.status(400).json({ message: `Database "${dbName}" does not exist. Please create it first.` });
        }
        return res.status(500).json({ message: 'Failed to connect to or initialize the database. Please check your credentials and ensure the database exists.' });

    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
        console.log('Database pool closed.');
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

