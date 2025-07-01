import { Router } from 'express';
import { setup } from '../controllers/setup.controller';

const router = Router();

router.post('/setup', setup);

export default router;
