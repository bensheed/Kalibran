import { Router, RequestHandler } from 'express';
import { getAllSettings, updateSettings } from '../controllers/settings.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/settings', getAllSettings as RequestHandler);
router.put('/api/settings', isAdmin as RequestHandler, updateSettings as RequestHandler);

export default router;
