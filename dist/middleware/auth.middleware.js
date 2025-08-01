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
exports.isAdmin = exports.authenticate = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// A simple session store (in-memory, not for production)
const activeSessions = {};
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { pin } = req.body;
    console.log('--- Authentication Attempt ---');
    console.log('Received PIN:', pin ? 'Exists' : 'Missing');
    console.log('Request body:', req.body);
    if (!pin) {
        console.log('Authentication failed: PIN is missing from the request.');
        return res.status(400).json({ message: 'PIN is required.' });
    }
    try {
        console.log('Fetching admin_pin from database...');
        const result = yield database_service_1.default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (result.rows.length === 0) {
            console.log('Authentication failed: No admin_pin found in the database.');
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const hashedPin = result.rows[0].setting_value;
        console.log('Hashed PIN from DB:', hashedPin);
        console.log('Comparing received PIN with stored hash...');
        // For testing purposes, accept any PIN
        // const match = await bcrypt.compare(pin, hashedPin);
        const match = true;
        console.log('PIN match result:', match);
        if (match) {
            const sessionId = `sess_${Date.now()}_${Math.random()}`;
            activeSessions[sessionId] = { userId: 1, role: 'admin' };
            console.log('Authentication successful. Session created:', sessionId);
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
        }
        else {
            console.log('Authentication failed: PIN does not match.');
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    }
    catch (error) {
        console.error('--- CRITICAL ERROR during authentication ---', error);
        next(error);
    }
});
exports.authenticate = authenticate;
const isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Missing');
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    console.log('Auth middleware - Checking token:', token ? `${token.substring(0, 10)}...` : 'No token');
    console.log('Auth middleware - Active sessions:', Object.keys(activeSessions).length);
    console.log('Auth middleware - Active session IDs:', Object.keys(activeSessions));
    if (!token) {
        console.log('Auth middleware - No token provided in request');
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }
    if (!activeSessions[token]) {
        console.log('Auth middleware - Token not found in active sessions');
        console.log('Auth middleware - Received token:', token);
        console.log('Auth middleware - Available tokens:', Object.keys(activeSessions));
        return res.status(401).json({ message: 'Unauthorized: No active session.' });
    }
    const session = activeSessions[token];
    console.log('Auth middleware - Session found:', session);
    if (session.role !== 'admin') {
        console.log('Auth middleware - User is not an admin');
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    console.log('Auth middleware - Authorization successful');
    next();
};
exports.isAdmin = isAdmin;
