import { Router, RequestHandler } from 'express';
import { setup } from '../controllers/setup.controller';

const router = Router();

router.post('/api/setup', setup as RequestHandler);

export default router;
