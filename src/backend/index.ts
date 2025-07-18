import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import pool from './services/database.service';
import setupRoutes from './routes/setup.routes';
import syncRoutes from './routes/sync.routes';
import boardRoutes from './routes/boards.routes';
import columnRoutes from './routes/columns.routes';
import cardRoutes from './routes/cards.routes';
import settingsRoutes from './routes/settings.routes';
import authRoutes from './routes/auth.routes';
import { authenticate } from './middleware/auth.middleware';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 3001;

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow requests from the local frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(require('cookie-parser')());
app.use(express.json());

// Serve static files from the React app
// Use absolute path for Docker compatibility
const staticPath = process.env.NODE_ENV === 'production' 
    ? '/app/src/frontend/build'
    : path.join(__dirname, '../../src/frontend/build');
console.log('Static files path:', staticPath);
app.use(express.static(staticPath));

// Setup check middleware
const checkSetup: express.RequestHandler = async (req, res, next) => {
    // Exclude setup routes from this check
    if (req.path.startsWith('/setup')) {
        return next();
    }

    try {
        const result = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'setup_complete'");
        if (result.rows.length === 0 || result.rows[0].setting_value !== 'true') {
            // The application is not set up.
            res.status(409).json({
                setupRequired: true,
                message: 'Application not configured. Please complete the setup process.',
            });
            return;
        }
        next();
    } catch (error) {
        // This could happen if the 'settings' table doesn't exist yet.
        if (error instanceof Error && 'code' in error && error.code === '42P01') { // '42P01' is undefined_table
            res.status(409).json({
                setupRequired: true,
                message: 'Database not initialized. Please run the setup.',
            });
            return;
        }
        console.error('Error checking setup status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Apply the setup check to all API routes
app.use('/api', checkSetup);

// Routes
app.use('/api/setup', setupRoutes);
app.use('/api', syncRoutes);
app.use('/api', boardRoutes);
app.use('/api', columnRoutes);
app.use('/api', cardRoutes);
app.use('/api', settingsRoutes);
// Use the auth routes - make it available at both /login and /api/login
app.use('/login', authRoutes);
app.use('/api/login', authRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/frontend/build/index.html'));
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
