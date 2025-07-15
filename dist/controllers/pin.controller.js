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
exports.setPin = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const setPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminPin } = req.body;
    if (!adminPin || typeof adminPin !== 'string' || !/^\d{4}$/.test(adminPin)) {
        return res.status(400).json({ message: 'A 4-digit PIN is required.' });
    }
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPin = yield bcrypt_1.default.hash(adminPin, salt);
        const client = yield database_service_1.default.connect();
        try {
            yield client.query('BEGIN');
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pin', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1", [hashedPin]);
            yield client.query('COMMIT');
            res.status(201).json({ message: 'PIN set successfully.' });
        }
        catch (error) {
            yield client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Failed to set PIN:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ message: `Internal server error: ${errorMessage}` });
    }
});
exports.setPin = setPin;
