"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const database_service_1 = __importDefault(require("./services/database.service"));
const setup_routes_1 = __importDefault(require("./routes/setup.routes"));
const sync_routes_1 = __importDefault(require("./routes/sync.routes"));
const boards_routes_1 = __importDefault(require("./routes/boards.routes"));
const columns_routes_1 = __importDefault(require("./routes/columns.routes"));
const cards_routes_1 = __importDefault(require("./routes/cards.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
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
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from the React app
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
// Setup check middleware
const checkSetup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Exclude setup routes from this check
    if (req.path.startsWith('/api/setup')) {
        return next();
    }
    try {
        const result = yield database_service_1.default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin_pin'");
        if (result.rows.length === 0 || !result.rows[0].setting_value) {
            // No admin PIN is set, so the application is not set up.
            return res.status(409).json({
                setupRequired: true,
                message: 'Application not configured. Please complete the setup process.',
            });
        }
        next();
    }
    catch (error) {
        // This could happen if the 'settings' table doesn't exist yet.
        if (error instanceof Error && 'code' in error && error.code === '42P01') { // '42P01' is undefined_table
            return res.status(409).json({
                setupRequired: true,
                message: 'Database not initialized. Please run the setup.',
            });
        }
        console.error('Error checking setup status:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Apply the setup check to all API routes
app.use('/api', checkSetup);
// Routes
app.use('/api', setup_routes_1.default);
app.use('/api', sync_routes_1.default);
app.use('/api', boards_routes_1.default);
app.use('/api', columns_routes_1.default);
app.use('/api', cards_routes_1.default);
app.use('/api', settings_routes_1.default);
app.post('/api/login', (req, res, next) => {
    (0, auth_middleware_1.authenticate)(req, res, next);
});
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname + '../../../frontend/build/index.html'));
});
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
