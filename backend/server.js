import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';

import connectDB from './config/db.js';
import { autoSeedIfEmpty } from './utils/autoSeed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiGeneralLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import testSeriesRoutes from './routes/testSeriesRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import singleModelRoutes from './routes/singleModelRoutes.js';
import nonPharmaRoutes from './routes/nonPharmaRoutes.js';

dotenv.config();

// Ensure critical environment variables exist
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is required.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB & Auto-seed
connectDB().then(() => {
  autoSeedIfEmpty();
});

const app = express();

// Trust reverse proxy (Required for Render, Heroku, AWS ELB to handle X-Forwarded-For headers accurately)
app.set('trust proxy', 1);

// Gzip Compression for high-throughput responses
app.use(compression());

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Prevent NoSQL Injection attacks by sanitizing request data
app.use(mongoSanitize());

// Enable Cross-Origin Resource Sharing with strict origin matching
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://pharmacode07.onrender.com',
  'https://pharmacode-frontend.onrender.com',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  })
);

// Payload size limit to protect against Large Payload DoS attacks
app.use(
  express.json({
    limit: '2mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Apply General Rate Limiter to all API endpoints
app.use('/api', apiGeneralLimiter);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route - Pure Backend API Information
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 Pharmacode07Exams Backend API Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      testSeries: '/api/test-series',
      auth: '/api/auth',
      materials: '/api/materials',
      contact: '/api/contact',
    },
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Pharmacode07Exams Backend API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/test-series', testSeriesRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/single-models', singleModelRoutes);
app.use('/api/non-pharma', nonPharmaRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Pharmacode07Exams Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});
