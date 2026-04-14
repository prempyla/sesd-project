require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const sequelize = require('./config/database');
require('./models/index'); // Load all associations

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middlewares/errorHandler');
const EscalationScheduler = require('./jobs/EscalationScheduler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SETS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend SPA for non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ message: 'SETS API v1.0 — Frontend not found' });
  }
});

// Global error handler (must be last)
app.use(errorHandler);

// Database sync and server start
const start = async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    await sequelize.authenticate();
    console.log('[DB] SQLite connection established.');

    await sequelize.sync();
    console.log('[DB] All models synchronized.');

    // Start escalation background job
    EscalationScheduler.start();

    app.listen(PORT, () => {
      console.log(`\n🚀 SETS Server running → http://localhost:${PORT}`);
      console.log(`📋 API Docs: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend: http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.error('[FATAL] Could not start server:', err);
    process.exit(1);
  }
};

start();
