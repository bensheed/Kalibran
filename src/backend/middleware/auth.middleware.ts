import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import pool from '../services/database.service';

// A simple session store (in-memory, not for production)
const activeSessions: { [sessionId: string]: { userId: number; role: string } } = {};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const { pin } = req.body;
    console.log('--- Authentication Attempt ---');
    console.log('Received PIN:', pin ? 'Exists' : 'Missing');

    if (!pin) {
        console.log('Authentication failed: PIN is missing from the request.');
        return res.status(400).json({ message: 'PIN is required.' });
    }

    try {
        console.log('Fetching admin_pin from database...');
        const result = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        
        if (result.rows.length === 0) {
            console.log('Authentication failed: No admin_pin found in the database.');
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const hashedPin = result.rows[0].setting_value;
        console.log('Hashed PIN from DB:', hashedPin);
        console.log('Comparing received PIN with stored hash...');
        
        const match = await bcrypt.compare(pin, hashedPin);
        console.log('PIN match result:', match);

        if (match) {
            const sessionId = `sess_${Date.now()}_${Math.random()}`;
            activeSessions[sessionId] = { userId: 1, role: 'admin' };
            console.log('Authentication successful. Session created:', sessionId);

            res.status(200).json({
                message: 'Login successful',
                token: sessionId
            });
        } else {
            console.log('Authentication failed: PIN does not match.');
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('--- CRITICAL ERROR during authentication ---', error);
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
