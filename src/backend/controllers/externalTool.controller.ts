import { Request, Response } from 'express';
import pool from '../services/database.service';

export const setExternalTool = async (req: Request, res: Response) => {
    const { dbType } = req.body;

    if (!dbType || typeof dbType !== 'string') {
        return res.status(400).json({ message: 'Database type is required.' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_type', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [dbType]
            );
            await client.query('COMMIT');
            res.status(201).json({ message: 'External tool set successfully.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to set external tool:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
};
