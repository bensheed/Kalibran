import { Router } from 'express';
import { setupAdminPin } from '../controllers/setup.controller';

const router = Router();

// Route to set the admin PIN during the first-time setup
router.post('/setup/admin-pin', setupAdminPin);

export default router;
