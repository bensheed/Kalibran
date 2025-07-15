import { Router, Request, Response } from 'express';
import pool from '../services/database.service';
import bcrypt from 'bcrypt';

const router = Router();

// Login route handler
router.post('/', async (req: Request, res: Response): Promise<void> => {
  console.log('=== LOGIN ROUTE HIT ===');
  console.log('Login route hit with body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request path:', req.path);
  console.log('Request query:', req.query);
  console.log('Request params:', req.params);
  
  if (req.body && req.body.pin) {
    try {
      // Get the admin PIN from the database
      const result = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
      
      if (result.rows.length === 0) {
        console.log('No admin PIN found in database');
        res.status(401).json({ message: 'Invalid PIN. Please try again.' });
        return;
      }
      
      const storedHashedPin = result.rows[0].setting_value;
      console.log('Stored hashed PIN:', storedHashedPin, 'Entered PIN:', req.body.pin);
      
      // Compare the entered PIN with the stored hashed PIN using bcrypt
      const pinMatches = await bcrypt.compare(req.body.pin, storedHashedPin);
      if (pinMatches) {
        console.log('PIN matched, creating session');
        const sessionId = `sess_${Date.now()}_${Math.random()}`;
        
        // Set a cookie for the session
        res.cookie('session_id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          path: '/',
          sameSite: 'lax'
        });
        
        console.log('Sending successful response with token:', sessionId);
        
        res.status(200).json({
          message: 'Login successful',
          token: sessionId
        });
        return;
      } else {
        console.log('PIN did not match');
        res.status(401).json({ message: 'Invalid PIN. Please try again.' });
        return;
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error during login.' });
      return;
    }
  } else {
    console.log('No PIN in request body');
    res.status(400).json({ message: 'PIN is required.' });
    return;
  }
});

export default router;