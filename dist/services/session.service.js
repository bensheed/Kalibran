"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSessions = exports.deleteSession = exports.getSession = exports.createSession = void 0;
const database_service_1 = __importDefault(require("./database.service"));
// Database-backed session storage for persistence
const createSession = (sessionId, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First, clean up expired sessions (older than 24 hours)
        yield database_service_1.default.query(`
            DELETE FROM user_sessions 
            WHERE created_at < NOW() - INTERVAL '24 hours'
        `);
        // Create new session
        yield database_service_1.default.query(`
            INSERT INTO user_sessions (session_id, user_id, role, created_at, last_accessed)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (session_id) 
            DO UPDATE SET last_accessed = NOW()
        `, [sessionId, userId, role]);
        console.log('[SESSION] Session created in database:', sessionId);
    }
    catch (error) {
        console.error('[SESSION] Error creating session:', error);
        // Fallback to in-memory storage if database fails
        activeSessions[sessionId] = { userId, role };
        console.log('[SESSION] Fallback: Session created in memory:', sessionId);
    }
});
exports.createSession = createSession;
const getSession = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try to get from database first
        const result = yield database_service_1.default.query(`
            SELECT user_id, role 
            FROM user_sessions 
            WHERE session_id = $1 
            AND created_at > NOW() - INTERVAL '24 hours'
        `, [sessionId]);
        if (result.rows.length > 0) {
            // Update last accessed time
            yield database_service_1.default.query(`
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
    }
    catch (error) {
        console.error('[SESSION] Error getting session from database:', error);
        // Fallback to in-memory storage
        const session = activeSessions[sessionId];
        console.log('[SESSION] Fallback: Session lookup in memory for', sessionId, ':', session ? 'Found' : 'Not found');
        return session || null;
    }
});
exports.getSession = getSession;
const deleteSession = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_service_1.default.query(`
            DELETE FROM user_sessions 
            WHERE session_id = $1
        `, [sessionId]);
        console.log('[SESSION] Session deleted from database:', sessionId);
    }
    catch (error) {
        console.error('[SESSION] Error deleting session from database:', error);
        // Fallback to in-memory storage
        delete activeSessions[sessionId];
        console.log('[SESSION] Fallback: Session deleted from memory:', sessionId);
    }
});
exports.deleteSession = deleteSession;
const getAllSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_service_1.default.query(`
            SELECT session_id, user_id, role 
            FROM user_sessions 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        const sessions = {};
        result.rows.forEach(row => {
            sessions[row.session_id] = {
                userId: row.user_id,
                role: row.role
            };
        });
        return sessions;
    }
    catch (error) {
        console.error('[SESSION] Error getting all sessions from database:', error);
        return activeSessions;
    }
});
exports.getAllSessions = getAllSessions;
// Keep in-memory fallback for backwards compatibility
const activeSessions = {};
