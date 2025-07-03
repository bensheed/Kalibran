"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sync_controller_1 = require("../controllers/sync.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Route to trigger a manual data sync (admin only)
router.post('/sync', auth_middleware_1.isAdmin, sync_controller_1.triggerSync);
exports.default = router;
