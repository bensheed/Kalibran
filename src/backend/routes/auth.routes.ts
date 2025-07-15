import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, logout } from '../middleware/auth.middleware';

const router = Router();

// Login route - uses the authenticate middleware
router.post('/', (req: Request, res: Response, next: NextFunction) => {
    authenticate(req, res, next);
});

// Logout route
router.post('/logout', (req: Request, res: Response) => {
    logout(req, res);
});

export default router;