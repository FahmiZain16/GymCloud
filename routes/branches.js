const express = require('express');
const router = express.Router();
const BranchService = require('../services/BranchService');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

// POST /api/branches - Create Branch (8-step automation)
router.post('/', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const { name, city, address, adminName, adminEmail } = req.body;

    // Validasi input
    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: 'Nama, kota, dan alamat harus diisi'
      });
    }

    const branchData = {
      name,
      city,
      address,
      adminName,
      adminEmail
    };

    const result = await BranchService.createBranch(branchData, req.user.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET /api/branches - Get all branches
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await BranchService.getAllBranches();
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// GET /api/branches/:id - Get branch by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const branchId = req.params.id;
    const result = await BranchService.getBranchById(branchId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// PUT /api/branches/:id - Update branch
router.put('/:id', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const branchId = req.params.id;
    const updateData = req.body;

    const result = await BranchService.updateBranch(branchId, updateData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

module.exports = router;
