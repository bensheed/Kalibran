import { Router } from 'express';
import {
    getAllBoards,
    createBoard,
    getBoardById,
    updateBoard,
} from '../controllers/boards.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/boards', getAllBoards);
router.post('/boards', isAdmin, createBoard);
router.get('/boards/:id', getBoardById);
router.put('/boards/:id', isAdmin, updateBoard);

export default router;
