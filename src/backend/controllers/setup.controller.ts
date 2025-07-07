import { Request, Response } from 'express';
import pool from '../services/database.service';

export const setup = async (req: Request, res: Response) => {
    try {
        // Mark setup as complete
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
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
