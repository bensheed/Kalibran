"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setup_controller_1 = require("../controllers/setup.controller");
const router = (0, express_1.Router)();
router.post('/', setup_controller_1.setup);
router.post('/reset', setup_controller_1.resetSetup);
exports.default = router;
