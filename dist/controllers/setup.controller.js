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
exports.setup = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const setup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminPin, externalDb } = req.body;
    // Basic validation
    if (!adminPin || typeof adminPin !== 'string' || !/^\d{4}$/.test(adminPin) || !externalDb) {
        return res.status(400).json({ message: 'Invalid setup data. A 4-digit PIN and external DB config are required.' });
    }
    try {
        // Check if setup has already been completed
        const existingPin = yield database_service_1.default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (existingPin.rows.length > 0 && existingPin.rows[0].setting_value) {
            return res.status(409).json({ message: 'Application has already been configured.' });
        }
        const client = yield database_service_1.default.connect();
        try {
            yield client.query('BEGIN');
            // Hash the admin PIN
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPin = yield bcrypt_1.default.hash(adminPin, salt);
            // Save the hashed PIN
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ('admin_pin', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1", [hashedPin]);
            // Save external DB config (should be encrypted in a real app)
            yield client.query("INSERT INTO settings (setting_key, setting_value) VALUES ('external_db_config', $1) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1", [JSON.stringify(externalDb)]);
            yield client.query('COMMIT');
            res.status(201).json({ message: 'Setup completed successfully.' });
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
        console.error('Setup failed:', error);
        res.status(500).json({ message: 'Internal server error during setup.' });
    }
});
exports.setup = setup;
