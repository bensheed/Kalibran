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
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSync = void 0;
const sync_service_1 = require("../services/sync.service");
const triggerSync = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, sync_service_1.syncProCalData)();
        res.status(200).json({ message: 'Data sync completed successfully.' });
    }
    catch (error) {
        console.error('Sync trigger failed:', error);
        res.status(500).json({ message: 'Data sync failed.' });
    }
});
exports.triggerSync = triggerSync;
