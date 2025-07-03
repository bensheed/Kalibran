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
exports.updateBoard = exports.getBoardById = exports.createBoard = exports.getAllBoards = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// GET /api/boards - List all boards
const getAllBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_service_1.default.query('SELECT id, name FROM boards');
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching boards' });
    }
});
exports.getAllBoards = getAllBoards;
// POST /api/boards - Create a new board
const createBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Board name is required' });
    }
    try {
        const result = yield database_service_1.default.query('INSERT INTO boards (name, card_layout_config) VALUES ($1, $2) RETURNING *', [name, {}] // Default empty config
        );
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating board' });
    }
});
exports.createBoard = createBoard;
// GET /api/boards/:id - Get details for a single board
const getBoardById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const boardResult = yield database_service_1.default.query('SELECT * FROM boards WHERE id = $1', [id]);
        if (boardResult.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }
        const board = boardResult.rows[0];
        const columnsResult = yield database_service_1.default.query('SELECT * FROM columns WHERE board_id = $1 ORDER BY column_order', [id]);
        board.columns = columnsResult.rows;
        // This is a simplified version. A real implementation would be more complex.
        const cardsResult = yield database_service_1.default.query('SELECT * FROM kanban_cards_view');
        board.cards = cardsResult.rows;
        res.status(200).json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching board details' });
    }
});
exports.getBoardById = getBoardById;
// PUT /api/boards/:id - Update board settings
const updateBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, card_layout_config } = req.body;
    try {
        const result = yield database_service_1.default.query('UPDATE boards SET name = COALESCE($1, name), card_layout_config = COALESCE($2, card_layout_config) WHERE id = $3 RETURNING *', [name, card_layout_config, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating board' });
    }
});
exports.updateBoard = updateBoard;
