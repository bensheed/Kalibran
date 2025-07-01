import { Request, Response } from 'express';
import pool from '../services/database.service';
import bcrypt from 'bcrypt';

export const setup = async (req: Request, res: Response) => {
    const { adminPin, externalDb } = req.body;

    // Basic validation
    if (!adminPin || typeof adminPin !== 'string' || !/^\d{4}$/.test(adminPin) || !externalDb) {
        return res.status(400).json({ message: 'Invalid setup data. A 4-digit PIN and external DB config are required.' });
    }

    try {
        // Check if setup has already been completed
        const existingPin = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (existingPin.rows.length > 0 && existingPin.rows[0].setting_value) {
            return res.status(409).json({ message: 'Application has already been configured.' });
        }

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

            // Save external DB config (should be encrypted in a real app)
            await client.query(
                "INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1",
                [JSON.stringify(externalDb)]
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
        res.status(500).json({ message: 'Internal server error during setup.' });
    }
};
