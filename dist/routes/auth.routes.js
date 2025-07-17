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
const express_1 = require("express");
const database_service_1 = __importDefault(require("../services/database.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const session_service_1 = require("../services/session.service");
const router = (0, express_1.Router)();
// Login route handler
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('=== LOGIN ROUTE HIT ===');
    console.log('Login route hit with body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request path:', req.path);
    console.log('Request query:', req.query);
    console.log('Request params:', req.params);
    if (req.body && req.body.pin) {
        try {
            // Get the admin PIN from the database
            const result = yield database_service_1.default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
            if (result.rows.length === 0) {
                console.log('No admin PIN found in database');
                res.status(401).json({ message: 'Invalid PIN. Please try again.' });
                return;
            }
            const storedHashedPin = result.rows[0].setting_value;
            console.log('Stored hashed PIN:', storedHashedPin, 'Entered PIN:', req.body.pin);
            // Compare the entered PIN with the stored hashed PIN using bcrypt
            const pinMatches = yield bcrypt_1.default.compare(req.body.pin, storedHashedPin);
            if (pinMatches) {
                console.log('PIN matched, creating session');
                const sessionId = `sess_${Date.now()}_${Math.random()}`;
                // Store the session in the shared session service
                (0, session_service_1.createSession)(sessionId, 1, 'admin');
                // Set a cookie for the session
                res.cookie('session_id', sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    path: '/',
                    sameSite: 'lax'
                });
                console.log('Sending successful response with token:', sessionId);
                res.status(200).json({
                    message: 'Login successful',
                    token: sessionId
                });
                return;
            }
            else {
                console.log('PIN did not match');
                res.status(401).json({ message: 'Invalid PIN. Please try again.' });
                return;
            }
        }
        catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ message: 'Internal server error during login.' });
            return;
        }
    }
    else {
        console.log('No PIN in request body');
        res.status(400).json({ message: 'PIN is required.' });
        return;
    }
}));
exports.default = router;
