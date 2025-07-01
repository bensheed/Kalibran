import { Router } from 'express';
import { addColumn, updateColumn } from '../controllers/columns.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/columns', isAdmin, addColumn);
router.put('/columns/:id', isAdmin, updateColumn);

export default router;
