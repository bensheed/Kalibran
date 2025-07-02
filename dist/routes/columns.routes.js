"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const columns_controller_1 = require("../controllers/columns.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/columns', auth_middleware_1.isAdmin, columns_controller_1.addColumn);
router.put('/columns/:id', auth_middleware_1.isAdmin, columns_controller_1.updateColumn);
exports.default = router;
