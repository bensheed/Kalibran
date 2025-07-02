"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setup_controller_1 = require("../controllers/setup.controller");
const router = (0, express_1.Router)();
router.post('/setup', setup_controller_1.setup);
exports.default = router;
