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
exports.updateSettings = exports.getAllSettings = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// GET /api/settings - Retrieve all global settings
const getAllSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_service_1.default.query('SELECT setting_key, setting_value FROM settings');
        const settings = result.rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
        res.status(200).json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
});
exports.getAllSettings = getAllSettings;
// PUT /api/settings - Update global settings
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = req.body;
    const client = yield database_service_1.default.connect();
    try {
        yield client.query('BEGIN');
        for (const key in settings) {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                const value = settings[key];
                yield client.query('INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2', [key, value]);
            }
        }
        yield client.query('COMMIT');
        res.status(200).json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        yield client.query('ROLLBACK');
        res.status(500).json({ message: 'Error updating settings' });
    }
    finally {
        client.release();
    }
});
exports.updateSettings = updateSettings;
