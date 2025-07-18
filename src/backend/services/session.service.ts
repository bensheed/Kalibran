import pool from './database.service';

// Shared session storage service
export interface SessionData {
    userId: number;
    role: string;
}

// Database-backed session storage for persistence
export const createSession = async (sessionId: string, userId: number, role: string): Promise<void> => {
    try {
        // First, clean up expired sessions (older than 24 hours)
        await pool.query(`
            DELETE FROM user_sessions 
            WHERE created_at < NOW() - INTERVAL '24 hours'
        `);
        
        // Create new session
        await pool.query(`
            INSERT INTO user_sessions (session_id, user_id, role, created_at, last_accessed)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (session_id) 
            DO UPDATE SET last_accessed = NOW()
        `, [sessionId, userId, role]);
        
        console.log('[SESSION] Session created in database:', sessionId);
    } catch (error) {
        console.error('[SESSION] Error creating session:', error);
        // Fallback to in-memory storage if database fails
        activeSessions[sessionId] = { userId, role };
        console.log('[SESSION] Fallback: Session created in memory:', sessionId);
    }
};

export const getSession = async (sessionId: string): Promise<SessionData | null> => {
    try {
        // Try to get from database first
        const result = await pool.query(`
            SELECT user_id, role 
            FROM user_sessions 
            WHERE session_id = $1 
            AND created_at > NOW() - INTERVAL '24 hours'
        `, [sessionId]);
        
        if (result.rows.length > 0) {
            // Update last accessed time
            await pool.query(`
                UPDATE user_sessions 
                SET last_accessed = NOW() 
                WHERE session_id = $1
            `, [sessionId]);
            
            const session = {
                userId: result.rows[0].user_id,
                role: result.rows[0].role
            };
            console.log('[SESSION] Session found in database:', sessionId);
            return session;
        }
        
        console.log('[SESSION] Session not found in database:', sessionId);
        return null;
    } catch (error) {
        console.error('[SESSION] Error getting session from database:', error);
        // Fallback to in-memory storage
        const session = activeSessions[sessionId];
        console.log('[SESSION] Fallback: Session lookup in memory for', sessionId, ':', session ? 'Found' : 'Not found');
        return session || null;
    }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
    try {
        await pool.query(`
            DELETE FROM user_sessions 
            WHERE session_id = $1
        `, [sessionId]);
        console.log('[SESSION] Session deleted from database:', sessionId);
    } catch (error) {
        console.error('[SESSION] Error deleting session from database:', error);
        // Fallback to in-memory storage
        delete activeSessions[sessionId];
        console.log('[SESSION] Fallback: Session deleted from memory:', sessionId);
    }
};

export const getAllSessions = async (): Promise<{ [sessionId: string]: SessionData }> => {
    try {
        const result = await pool.query(`
            SELECT session_id, user_id, role 
            FROM user_sessions 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        
        const sessions: { [sessionId: string]: SessionData } = {};
        result.rows.forEach(row => {
            sessions[row.session_id] = {
                userId: row.user_id,
                role: row.role
            };
        });
        
        return sessions;
    } catch (error) {
        console.error('[SESSION] Error getting all sessions from database:', error);
        return activeSessions;
    }
};

// Keep in-memory fallback for backwards compatibility
const activeSessions: { [sessionId: string]: SessionData } = {};