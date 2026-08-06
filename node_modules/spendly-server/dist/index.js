"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_routes_js_1 = __importDefault(require("./routes/api.routes.js"));
const seed_js_1 = require("./seed.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS — allow client dev server and production
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.CLIENT_URL || 'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// JSON body parser (multer handles multipart/form-data separately per route)
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// API Routes
app.use('/api', api_routes_js_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Spendly API', timestamp: new Date().toISOString() });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('[API Error]:', err.message);
    if (err.message.includes('File too large')) {
        return res.status(413).json({ error: 'File size exceeds 5MB limit.' });
    }
    if (err.message.includes('Only PNG')) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
app.listen(PORT, async () => {
    console.log(`🚀 Spendly Server running on http://localhost:${PORT}`);
    await (0, seed_js_1.seedDatabase)();
});
