"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cards_controller_1 = require("../controllers/cards.controller");
const router = (0, express_1.Router)();
router.put('/cards/:job_no/move', cards_controller_1.moveCard);
exports.default = router;
