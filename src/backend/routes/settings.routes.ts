import { Router } from 'express';
import { getAllSettings, updateSettings } from '../controllers/settings.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/settings', getAllSettings);
router.put('/settings', isAdmin, updateSettings);

export default router;
