const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');

dotenv.config();

const authRoutes = require('./routes/auth');
const websiteRoutes = require('./routes/websites');
const scanRoutes = require('./routes/scans');
const alertRoutes = require('./routes/alerts');
const automationRoutes = require('./routes/automation');
const imageAnalyzerRoutes = require('./routes/imageAnalyzer');
const adminRoutes = require('./routes/admin');
const aiProfitRoutes = require('./routes/aiProfit');
const jvzooRoutes = require('./routes/jvzoo');
const planRoutes = require('./routes/plans');
const { initializeAllSchedules } = require('./jobs/automationScheduler');
const aiRankerRoutes = require('./routes/aiRanker');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://complyzo.albinolabs.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/image', imageAnalyzerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-profit', aiProfitRoutes);
app.use('/api/jvzoo', jvzooRoutes);
app.use('/api/password', require('./routes/passwordReset'));
app.use('/api/plans', planRoutes);
app.use('/api/ai-ranker', aiRankerRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date(),
    endpoints: {
      image: '/api/image/test - Check image analyzer',
      jvzoo: '/api/jvzoo/ipn - JVZoo webhook handler',
      auth: '/api/auth - Authentication endpoints',
      scans: '/api/scans - Scan endpoints'
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.method} ${req.url} not found`,
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/websites',
      'POST /api/websites',
      'POST /api/scans',
      'GET /api/scans/:websiteId',
      'GET /api/scans/latest/:websiteId',
      'GET /api/alerts',
      'GET /api/image/test',
      'POST /api/image/analyze-images',
      'POST /api/jvzoo/ipn',  // ✅ Added JVZoo
      'GET /api/jvzoo/product-links',
      'GET /api/jvzoo/verify-payment/:email'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compliscan';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    initializeAllSchedules();
  })
  .catch(err => {
    console.log('⚠️ MongoDB not connected:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 CORS enabled for: http://localhost:3000, http://localhost:5173`);
  console.log(`📝 Test API: http://localhost:${PORT}/api/test`);
  console.log(`💰 JVZoo IPN: http://localhost:${PORT}/api/jvzoo/ipn\n`);
});
