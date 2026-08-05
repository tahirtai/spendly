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
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api', api_routes_js_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Spendly API', timestamp: new Date().toISOString() });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[API Error]:', err.message);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
app.listen(PORT, async () => {
    console.log(`🚀 Spendly Server running on port ${PORT}`);
    await (0, seed_js_1.seedDatabase)();
});
