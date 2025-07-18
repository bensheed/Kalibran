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
exports.updateColumn = exports.addColumn = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// POST /api/columns - Add a column to a board
const addColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { board_id, name } = req.body;
    if (!board_id || !name) {
        return res.status(400).json({ message: 'Board ID and column name are required' });
    }
    try {
        // Get the highest current order for the board
        const orderResult = yield database_service_1.default.query('SELECT MAX(column_order) as max_order FROM columns WHERE board_id = $1', [board_id]);
        const newOrder = (orderResult.rows[0].max_order || 0) + 1;
        const result = yield database_service_1.default.query('INSERT INTO columns (board_id, name, column_order, filter_rules) VALUES ($1, $2, $3, $4) RETURNING *', [board_id, name, newOrder, {}]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding column' });
    }
});
exports.addColumn = addColumn;
// PUT /api/columns/:id - Update a column's name, order, or filter rules
const updateColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, column_order, filter_rules } = req.body;
    try {
        const result = yield database_service_1.default.query('UPDATE columns SET name = COALESCE($1, name), column_order = COALESCE($2, column_order), filter_rules = COALESCE($3, filter_rules) WHERE id = $4 RETURNING *', [name, column_order, filter_rules, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Column not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating column' });
    }
});
exports.updateColumn = updateColumn;
