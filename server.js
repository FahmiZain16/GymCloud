const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branches');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GymCloud API Server Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      branches: '/api/branches',
      logs: '/api/logs'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🏋️  GymCloud API Server Running       ║
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}          ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
