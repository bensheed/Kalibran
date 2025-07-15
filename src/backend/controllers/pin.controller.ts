import { Request, Response } from 'express';
import pool from '../services/database.service';
import bcrypt from 'bcrypt';

export const setPin = async (req: Request, res: Response) => {
    const { adminPin } = req.body;

    if (!adminPin || typeof adminPin !== 'string' || !/^\d{4}$/.test(adminPin)) {
        return res.status(400).json({ message: 'A 4-digit PIN is required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(adminPin, salt);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pin', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [hashedPin]
            );
            await client.query('COMMIT');
            res.status(201).json({ message: 'PIN set successfully.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Failed to set PIN:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
};
