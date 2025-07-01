import { Request, Response } from 'express';
import pool from '../services/database.service';

const saltRounds = 10;

export const setupAdminPin = async (req: Request, res: Response) => {
    const { pin } = req.body;

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: 'A 4-digit PIN is required.' });
    }

    try {
        // Check if a PIN already exists
        const existingPin = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (existingPin.rows.length > 0 && existingPin.rows[0].setting_value) {
            return res.status(409).json({ message: 'Admin PIN has already been set.' });
        }

        const hashedPin = await bcrypt.hash(pin, saltRounds);

        // Using INSERT with ON CONFLICT to handle potential race conditions
        const query = {
            text: `
                INSERT INTO settings (setting_key, setting_value) 
                VALUES ('admin_pin', $1) 
                ON CONFLICT (setting_key) 
                DO UPDATE SET setting_value = $1;
            `,
            values: [hashedPin],
        };

        await pool.query(query);

        res.status(201).json({ message: 'Admin PIN has been set successfully.' });
    } catch (error) {
        console.error('Error setting admin PIN:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
