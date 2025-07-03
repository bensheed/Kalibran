import { Router, RequestHandler } from 'express';
import { addColumn, updateColumn } from '../controllers/columns.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/columns', isAdmin as RequestHandler, addColumn as RequestHandler);
router.put('/columns/:id', isAdmin as RequestHandler, updateColumn as RequestHandler);

export default router;
