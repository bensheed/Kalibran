"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBoard = exports.getBoardById = exports.createBoard = exports.getAllBoards = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// GET /api/boards - List all boards
const getAllBoards = async (req, res) => {
    try {
        const result = await database_service_1.default.query('SELECT id, name FROM boards');
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching boards' });
    }
};
exports.getAllBoards = getAllBoards;
// POST /api/boards - Create a new board
const createBoard = async (req, res) => {
    console.log('Creating new board - Request body:', req.body);
    console.log('Auth headers:', req.headers.authorization);
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Board name is required' });
    }
    try {
        console.log('Creating board with name:', name);
        const result = await database_service_1.default.query('INSERT INTO boards (name, card_layout_config) VALUES ($1, $2) RETURNING *', [name, {}] // Default empty config
        );
        console.log('Board created successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ message: 'Error creating board' });
    }
};
exports.createBoard = createBoard;
// GET /api/boards/:id - Get details for a single board
const getBoardById = async (req, res) => {
    const { id } = req.params;
    try {
        const boardResult = await database_service_1.default.query('SELECT * FROM boards WHERE id = $1', [id]);
        if (boardResult.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }
        const board = boardResult.rows[0];
        const columnsResult = await database_service_1.default.query('SELECT * FROM columns WHERE board_id = $1 ORDER BY column_order', [id]);
        board.columns = columnsResult.rows;
        // This is a simplified version. A real implementation would be more complex.
        const cardsResult = await database_service_1.default.query('SELECT * FROM kanban_cards_view');
        board.cards = cardsResult.rows;
        res.status(200).json(board);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching board details' });
    }
};
exports.getBoardById = getBoardById;
// PUT /api/boards/:id - Update board settings
const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { name, card_layout_config } = req.body;
    try {
        const result = await database_service_1.default.query('UPDATE boards SET name = COALESCE($1, name), card_layout_config = COALESCE($2, card_layout_config) WHERE id = $3 RETURNING *', [name, card_layout_config, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Board not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating board' });
    }
};
exports.updateBoard = updateBoard;
