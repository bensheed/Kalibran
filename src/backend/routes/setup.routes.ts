import { Router, RequestHandler } from 'express';
import { setup, resetSetup } from '../controllers/setup.controller';

const router = Router();

router.post('/', setup as RequestHandler);
router.post('/reset', resetSetup as RequestHandler);

export default router;
