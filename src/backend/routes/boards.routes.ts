import { Router, RequestHandler } from 'express';
import {
    getAllBoards,
    createBoard,
    getBoardById,
    updateBoard,
} from '../controllers/boards.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/boards', getAllBoards as RequestHandler);
router.post('/api/boards', isAdmin as RequestHandler, createBoard as RequestHandler);
router.get('/api/boards/:id', getBoardById as RequestHandler);
router.put('/api/boards/:id', isAdmin as RequestHandler, updateBoard as RequestHandler);

export default router;
