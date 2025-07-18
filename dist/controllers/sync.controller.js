"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSync = void 0;
const sync_service_1 = require("../services/sync.service");
const triggerSync = async (req, res) => {
    try {
        await (0, sync_service_1.syncProCalData)();
        res.status(200).json({ message: 'Data sync completed successfully.' });
    }
    catch (error) {
        console.error('Sync trigger failed:', error);
        res.status(500).json({ message: 'Data sync failed.' });
    }
};
exports.triggerSync = triggerSync;
