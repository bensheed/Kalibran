import { Request, Response } from 'express';
import pool from '../services/database.service';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

export const setup = async (req: Request, res: Response) => {
    const { adminPin, dbType, dbHost, dbPort, dbUser, dbPassword, dbName } = req.body;

    // Basic validation
    if (!adminPin || typeof adminPin !== 'string' || !/^\d{4}$/.test(adminPin)) {
        return res.status(400).json({ message: 'A 4-digit PIN is required.' });
    }
    if (!dbType || !dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
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
    const testPool = new Pool(dbConfig);
    try {
        const testClient = await testPool.connect();
        testClient.release();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        return res.status(400).json({ message: 'Failed to connect to the database. Please check your credentials.' });
    } finally {
        await testPool.end();
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Hash the admin PIN
            const salt = await bcrypt.genSalt(10);
            const hashedPin = await bcrypt.hash(adminPin, salt);

            // Save the hashed PIN
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pin', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [hashedPin]
            );

            // Save external DB type
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_type', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [dbType]
            );

            // Save external DB config
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [JSON.stringify(dbConfig)]
            );

            // Mark setup as complete
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('setup_complete', 'true') ON CONFLICT (setting_key) DO UPDATE SET setting_value = 'true'"
            );

            await client.query('COMMIT');
            res.status(201).json({ message: 'Setup completed successfully.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Setup failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message: `Internal server error during setup: ${errorMessage}` });
    }
};
