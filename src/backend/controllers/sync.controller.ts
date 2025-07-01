import { Request, Response } from 'express';
import { syncProCalData } from '../services/sync.service';

export const triggerSync = async (req: Request, res: Response) => {
    try {
        await syncProCalData();
        res.status(200).json({ message: 'Data sync completed successfully.' });
    } catch (error) {
        console.error('Sync trigger failed:', error);
        res.status(500).json({ message: 'Data sync failed.' });
    }
};
