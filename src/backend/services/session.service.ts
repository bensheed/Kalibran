// Shared session storage service
export interface SessionData {
    userId: number;
    role: string;
}

// A simple session store (in-memory, not for production)
const activeSessions: { [sessionId: string]: SessionData } = {};

export const createSession = (sessionId: string, userId: number, role: string): void => {
    activeSessions[sessionId] = { userId, role };
    console.log('[SESSION] Session created:', sessionId, 'Total sessions:', Object.keys(activeSessions).length);
};

export const getSession = (sessionId: string): SessionData | null => {
    const session = activeSessions[sessionId];
    console.log('[SESSION] Session lookup for', sessionId, ':', session ? 'Found' : 'Not found');
    console.log('[SESSION] Active sessions:', Object.keys(activeSessions).length);
    console.log('[SESSION] Active session IDs:', Object.keys(activeSessions));
    return session || null;
};

export const deleteSession = (sessionId: string): void => {
    delete activeSessions[sessionId];
    console.log('[SESSION] Session deleted:', sessionId, 'Remaining sessions:', Object.keys(activeSessions).length);
};

export const getAllSessions = (): { [sessionId: string]: SessionData } => {
    return activeSessions;
};