"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSessions = exports.deleteSession = exports.getSession = exports.createSession = void 0;
// A simple session store (in-memory, not for production)
const activeSessions = {};
const createSession = (sessionId, userId, role) => {
    activeSessions[sessionId] = { userId, role };
    console.log('[SESSION] Session created:', sessionId, 'Total sessions:', Object.keys(activeSessions).length);
};
exports.createSession = createSession;
const getSession = (sessionId) => {
    const session = activeSessions[sessionId];
    console.log('[SESSION] Session lookup for', sessionId, ':', session ? 'Found' : 'Not found');
    console.log('[SESSION] Active sessions:', Object.keys(activeSessions).length);
    console.log('[SESSION] Active session IDs:', Object.keys(activeSessions));
    return session || null;
};
exports.getSession = getSession;
const deleteSession = (sessionId) => {
    delete activeSessions[sessionId];
    console.log('[SESSION] Session deleted:', sessionId, 'Remaining sessions:', Object.keys(activeSessions).length);
};
exports.deleteSession = deleteSession;
const getAllSessions = () => {
    return activeSessions;
};
exports.getAllSessions = getAllSessions;
