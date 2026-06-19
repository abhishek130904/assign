require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const adminRoutes = require('./src/routes/admin.routes');
const { authLimiter, globalLimiter } = require('./src/middlewares/rateLimiter');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow mobile (no CORS) + web clients
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.startsWith('http://localhost:') || 
                      origin.endsWith('.vercel.app');
                      
    if (isAllowed) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));

// Body parsing (limit 10kb to prevent payload attacks)
app.use(express.json({ limit: '10kb' }));

// Prevent NoSQL injection (e.g., { $gt: '' } in body)
app.use(mongoSanitize());

// Global rate limiter
app.use(globalLimiter);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', environment: process.env.NODE_ENV, timestamp: new Date() })
);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
