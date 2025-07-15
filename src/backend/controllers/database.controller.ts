import { Request, Response } from 'express';
import pool from '../services/database.service';
import { Pool } from 'pg';

export const setDatabase = async (req: Request, res: Response) => {
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
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [JSON.stringify(dbConfig)]
            );
            await client.query('COMMIT');
            res.status(201).json({ message: 'Database configured successfully.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to set database config:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
};
