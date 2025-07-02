import { Router, RequestHandler } from 'express';
import {
    getAllBoards,
    createBoard,
    getBoardById,
    updateBoard,
} from '../controllers/boards.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/boards', getAllBoards as RequestHandler);
router.post('/boards', isAdmin as RequestHandler, createBoard as RequestHandler);
router.get('/boards/:id', getBoardById as RequestHandler);
router.put('/boards/:id', isAdmin as RequestHandler, updateBoard as RequestHandler);

export default router;
