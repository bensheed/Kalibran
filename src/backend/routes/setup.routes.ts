import { Router, RequestHandler } from 'express';
import { setPin } from '../controllers/pin.controller';
import { setExternalTool } from '../controllers/externalTool.controller';
import { setDatabase } from '../controllers/database.controller';
import { setup } from '../controllers/setup.controller';

const router = Router();

router.post('/setup/pin', setPin as RequestHandler);
router.post('/setup/external-tool', setExternalTool as RequestHandler);
router.post('/setup/database', setDatabase as RequestHandler);
router.post('/setup/complete', setup as RequestHandler);

export default router;
