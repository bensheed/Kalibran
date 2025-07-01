import { Router } from 'express';
import { triggerSync } from '../controllers/sync.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Route to trigger a manual data sync (admin only)
router.post('/sync', isAdmin, triggerSync);

export default router;
