import { Router, RequestHandler } from 'express';
import { setup, testDbConnection } from '../controllers/setup.controller';

const router = Router();

router.post('/setup', setup as RequestHandler);
router.post('/setup/test-db', testDbConnection as RequestHandler);

export default router;
