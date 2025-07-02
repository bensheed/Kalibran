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
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_service_1 = __importDefault(require("../services/database.service"));
// A simple session store (in-memory, not for production)
const activeSessions = {};
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { pin } = req.body;
    if (!pin) {
        return res.status(400).json({ message: 'PIN is required.' });
    }
    try {
        const result = yield database_service_1.default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const hashedPin = result.rows[0].setting_value;
        const match = yield bcrypt_1.default.compare(pin, hashedPin);
        if (match) {
            // In a real app, you'd create a secure, signed session token (e.g., JWT)
            const sessionId = `sess_${Date.now()}_${Math.random()}`;
            activeSessions[sessionId] = { userId: 1, role: 'admin' }; // Assuming user 1 is the admin
            res.status(200).json({
                message: 'Login successful',
                token: sessionId // This is NOT a secure token
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.authenticate = authenticate;
const isAdmin = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token || !activeSessions[token]) {
        return res.status(401).json({ message: 'Unauthorized: No active session.' });
    }
    const session = activeSessions[token];
    if (session.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    next();
};
exports.isAdmin = isAdmin;
