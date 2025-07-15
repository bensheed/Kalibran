"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getAllSettings = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// GET /api/settings - Retrieve all global settings
const getAllSettings = async (req, res) => {
    try {
        const result = await database_service_1.default.query('SELECT setting_key, setting_value FROM settings');
        const settings = result.rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
        res.status(200).json(settings);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};
exports.getAllSettings = getAllSettings;
// PUT /api/settings - Update global settings
const updateSettings = async (req, res) => {
    const settings = req.body;
    const client = await database_service_1.default.connect();
    try {
        await client.query('BEGIN');
        for (const key in settings) {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                const value = settings[key];
                await client.query('INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2', [key, value]);
            }
        }
        await client.query('COMMIT');
        res.status(200).json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings' });
    }
    finally {
        client.release();
    }
};
exports.updateSettings = updateSettings;
