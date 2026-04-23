const express = require('express');
const router = express.Router();
const LogService = require('../services/LogService');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

// GET /api/logs - Get all logs (Super Admin only)
router.get('/', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await LogService.getAllLogs(limit);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET /api/logs/branch/:branchId - Get logs by branch
router.get('/branch/:branchId', authMiddleware, async (req, res) => {
  try {
    const branchId = req.params.branchId;
    const limit = parseInt(req.query.limit) || 50;

    // Check if user has access to this branch
    if (req.user.role !== 'super_admin' && req.user.branch_id != branchId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke log cabang ini'
      });
    }

    const result = await LogService.getLogsByBranch(branchId, limit);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get branch logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET /api/logs/user/:userId - Get logs by user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;

    // Users can only see their own logs unless they're super admin
    if (req.user.role !== 'super_admin' && req.user.id != userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke log user ini'
      });
    }

    const result = await LogService.getLogsByUser(userId, limit);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get user logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

module.exports = router;
