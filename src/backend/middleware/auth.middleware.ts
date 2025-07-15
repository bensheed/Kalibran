import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import pool from '../services/database.service';

// Session management functions
const createSession = async (userId: number, role: string): Promise<string> => {
    const sessionId = `sess_${Date.now()}_${Math.random()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await pool.query(
        'INSERT INTO sessions (session_id, user_id, role, expires_at) VALUES ($1, $2, $3, $4)',
        [sessionId, userId, role, expiresAt]
    );
    
    console.log('Database session created:', sessionId, 'expires at:', expiresAt);
    return sessionId;
};

const getSession = async (sessionId: string): Promise<{ userId: number; role: string } | null> => {
    const result = await pool.query(
        'SELECT user_id, role FROM sessions WHERE session_id = $1 AND expires_at > NOW()',
        [sessionId]
    );
    
    if (result.rows.length === 0) {
        console.log('Session not found or expired:', sessionId);
        return null;
    }
    
    // Update last_accessed timestamp
    await pool.query(
        'UPDATE sessions SET last_accessed = NOW() WHERE session_id = $1',
        [sessionId]
    );
    
    const session = { userId: result.rows[0].user_id, role: result.rows[0].role };
    console.log('Database session found:', sessionId, session);
    return session;
};

const cleanupExpiredSessions = async (): Promise<void> => {
    const result = await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
    if (result.rowCount && result.rowCount > 0) {
        console.log('Cleaned up', result.rowCount, 'expired sessions');
    }
};

const deleteSession = async (sessionId: string): Promise<void> => {
    await pool.query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
    console.log('Session deleted:', sessionId);
};

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { pin } = req.body;
    console.log('--- Authentication Attempt ---');
    console.log('Received PIN:', pin ? 'Exists' : 'Missing');

    if (!pin) {
        console.log('Authentication failed: PIN is missing from the request.');
        res.status(400).json({ message: 'PIN is required.' });
        return;
    }

    try {
        // Clean up expired sessions first
        await cleanupExpiredSessions();
        
        console.log('Fetching admin_pin from database...');
        const result = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        
        if (result.rows.length === 0) {
            console.log('Authentication failed: No admin_pin found in the database.');
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        const hashedPin = result.rows[0].setting_value;
        console.log('Comparing received PIN with stored hash...');
        
        // Use proper bcrypt comparison
        const match = await bcrypt.compare(pin, hashedPin);
        console.log('PIN match result:', match);

        if (match) {
            // Create database-backed session
            const sessionId = await createSession(1, 'admin');
            console.log('Authentication successful. Database session created:', sessionId);

            // Set a cookie for the session
            res.cookie('session_id', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

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

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    console.log('Auth middleware - Checking token:', token ? `${token.substring(0, 10)}...` : 'No token');
    
    if (!token) {
        console.log('Auth middleware - No token provided in request');
        res.status(401).json({ message: 'Unauthorized: No token provided.' });
        return;
    }
    
    try {
        // Get session from database
        const session = await getSession(token);
        
        if (!session) {
            console.log('Auth middleware - Token not found in database or expired');
            res.status(401).json({ message: 'Unauthorized: No active session.' });
            return;
        }

        console.log('Auth middleware - Database session found:', session);
        
        if (session.role !== 'admin') {
            console.log('Auth middleware - User is not an admin');
            res.status(403).json({ message: 'Forbidden: Admin access required.' });
            return;
        }

        console.log('Auth middleware - Authorization successful');
        next();
    } catch (error) {
        console.error('Auth middleware - Database error:', error);
        res.status(500).json({ message: 'Internal server error during authentication.' });
        return;
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
        res.status(400).json({ message: 'No token provided for logout.' });
        return;
    }
    
    try {
        await deleteSession(token);
        res.clearCookie('session_id');
        console.log('Logout successful for token:', token.substring(0, 10) + '...');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
};
