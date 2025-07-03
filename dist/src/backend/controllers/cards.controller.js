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
exports.moveCard = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// PUT /api/cards/:job_no/move - Move a card to a new column
const moveCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { job_no } = req.params;
    const { new_column_id, inst_id } = req.body;
    if (!new_column_id) {
        return res.status(400).json({ message: 'New column ID is required' });
    }
    const client = yield database_service_1.default.connect();
    try {
        yield client.query('BEGIN');
        // Find the last transition for the card and set the exited_at timestamp
        const lastTransition = yield client.query(`UPDATE column_transitions
            SET exited_at = NOW()
            WHERE job_no = $1 AND exited_at IS NULL
            RETURNING *`, [job_no]);
        // Determine the sequence number
        const sequenceResult = yield client.query('SELECT COUNT(*) as count FROM column_transitions WHERE job_no = $1 AND column_id = $2', [job_no, new_column_id]);
        const sequence_number = parseInt(sequenceResult.rows[0].count, 10) + 1;
        // Create a new transition record for the new column
        const newTransition = yield client.query(`INSERT INTO column_transitions (job_no, inst_id, column_id, entered_at, sequence_number)
            VALUES ($1, $2, $3, NOW(), $4)
            RETURNING *`, [job_no, inst_id, new_column_id, sequence_number]);
        yield client.query('COMMIT');
        res.status(200).json(newTransition.rows[0]);
    }
    catch (error) {
        yield client.query('ROLLBACK');
        res.status(500).json({ message: 'Error moving card' });
    }
    finally {
        client.release();
    }
});
exports.moveCard = moveCard;
