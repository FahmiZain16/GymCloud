const express = require('express');
const router = express.Router();
const LogService = require('../services/LogService');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

router.get('/', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await LogService.getAllLogs(limit);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Controller Error (Get All Logs):', error);

    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while retrieving all activity logs'
    });
  }
});

router.get('/branch/:branchId', authMiddleware, async (req, res) => {
  try {
    const branchId = req.params.branchId;
    const limit = parseInt(req.query.limit) || 50;

    if (req.user.role !== 'super_admin' && req.user.branch_id != branchId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have authority to view this branch activity log'
      });
    }

    const result = await LogService.getLogsByBranch(branchId, limit);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Controller Error (Get Branch Logs):', error);

    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while retrieving branch logs'
    });
  }
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;

    if (req.user.role !== 'super_admin' && req.user.id != userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have authority to view this user log'
      });
    }

    const result = await LogService.getLogsByUser(userId, limit);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Controller Error (Get User Logs):', error);

    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while retrieving user logs'
    });
  }
});

module.exports = router;
