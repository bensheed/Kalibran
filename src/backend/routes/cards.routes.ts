import { Router, RequestHandler } from 'express';
import { moveCard } from '../controllers/cards.controller';

const router = Router();

router.put('/cards/:job_no/move', moveCard as RequestHandler);

export default router;
