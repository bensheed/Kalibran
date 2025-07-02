import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import pool from '../services/database.service';

// A simple session store (in-memory, not for production)
const activeSessions: { [sessionId: string]: { userId: number; role: string } } = {};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const { pin } = req.body;

    if (!pin) {
        return res.status(400).json({ message: 'PIN is required.' });
    }

    try {
        const result = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const hashedPin = result.rows[0].setting_value;
        const match = await bcrypt.compare(pin, hashedPin);

        if (match) {
            // In a real app, you'd create a secure, signed session token (e.g., JWT)
            const sessionId = `sess_${Date.now()}_${Math.random()}`;
            activeSessions[sessionId] = { userId: 1, role: 'admin' }; // Assuming user 1 is the admin

            res.status(200).json({
                message: 'Login successful',
                token: sessionId // This is NOT a secure token
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        next(error);
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token || !activeSessions[token]) {
        return res.status(401).json({ message: 'Unauthorized: No active session.' });
    }

    const session = activeSessions[token];
    if (session.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    next();
};
