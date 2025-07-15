"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveCard = void 0;
const database_service_1 = __importDefault(require("../services/database.service"));
// PUT /api/cards/:job_no/move - Move a card to a new column
const moveCard = async (req, res) => {
    const { job_no } = req.params;
    const { new_column_id, inst_id } = req.body;
    if (!new_column_id) {
        return res.status(400).json({ message: 'New column ID is required' });
    }
    const client = await database_service_1.default.connect();
    try {
        await client.query('BEGIN');
        // Find the last transition for the card and set the exited_at timestamp
        const lastTransition = await client.query(`UPDATE column_transitions
            SET exited_at = NOW()
            WHERE job_no = $1 AND exited_at IS NULL
            RETURNING *`, [job_no]);
        // Determine the sequence number
        const sequenceResult = await client.query('SELECT COUNT(*) as count FROM column_transitions WHERE job_no = $1 AND column_id = $2', [job_no, new_column_id]);
        const sequence_number = parseInt(sequenceResult.rows[0].count, 10) + 1;
        // Create a new transition record for the new column
        const newTransition = await client.query(`INSERT INTO column_transitions (job_no, inst_id, column_id, entered_at, sequence_number)
            VALUES ($1, $2, $3, NOW(), $4)
            RETURNING *`, [job_no, inst_id, new_column_id, sequence_number]);
        await client.query('COMMIT');
        res.status(200).json(newTransition.rows[0]);
    }
    catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error moving card' });
    }
    finally {
        client.release();
    }
};
exports.moveCard = moveCard;
