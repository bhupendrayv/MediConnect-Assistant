const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8082'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Allow configured origins or any vercel.app domain preview/production
        if (
            allowedOrigins.indexOf(origin) !== -1 ||
            allowedOrigins.includes('*') ||
            origin.endsWith('.vercel.app') ||
            process.env.NODE_ENV !== 'production'
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Disable Mongoose buffering so DB operations fail fast (instead of hanging 10s)
mongoose.set('bufferCommands', false);

// Database Connection with exponential backoff retry logic
const connectDB = async (retryCount = 0) => {
    if (!process.env.MONGO_URI) {
        console.error('CRITICAL: MONGO_URI is missing from environment variables');
        return;
    }
    console.log(`Attempting MongoDB connection (attempt ${retryCount + 1})...`);
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error(`❌ MongoDB Connection Error (attempt ${retryCount + 1}):`, err.message);
        const retryDelay = Math.min(15000, 3000 * (retryCount + 1));
        console.log(`⏳ Retrying MongoDB connection in ${retryDelay / 1000}s...`);
        setTimeout(() => connectDB(retryCount + 1), retryDelay);
    }
};

// Handle mongoose connection events
mongoose.connection.on('connected', () => console.log('✅ Mongoose connected to MongoDB'));
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    setTimeout(() => connectDB(), 5000);
});
mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});

connectDB();

// Health Check Routes (bypass DB check)
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({
        status: 'UP',
        message: 'Smart Healthcare Assistant API is healthy',
        database: stateMap[dbState] || 'unknown',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/v1/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({
        status: 'UP',
        message: 'Smart Healthcare Assistant API v1 is healthy',
        database: stateMap[dbState] || 'unknown',
        dbState
    });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

// Middleware: Check DB readiness before hitting any API route that needs it
const checkDbReady = (req, res, next) => {
    if (req.path === '/health') return next();
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database is not connected yet. The server is starting up — please wait a moment and try again.',
            dbState: mongoose.connection.readyState
        });
    }
    next();
};

app.use('/api/v1/user', checkDbReady);
app.use('/api/v1/admin', checkDbReady);
app.use('/api/v1/doctor', checkDbReady);

app.use('/api/v1/user', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/doctor', doctorRoutes);

// Global 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection Error:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception Error:', err);
});

module.exports = app;
