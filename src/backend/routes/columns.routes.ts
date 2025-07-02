import { Router, RequestHandler } from 'express';
import { addColumn, updateColumn } from '../controllers/columns.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/api/columns', isAdmin as RequestHandler, addColumn as RequestHandler);
router.put('/api/columns/:id', isAdmin as RequestHandler, updateColumn as RequestHandler);

export default router;
