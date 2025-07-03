"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/settings', settings_controller_1.getAllSettings);
router.put('/settings', auth_middleware_1.isAdmin, settings_controller_1.updateSettings);
exports.default = router;
