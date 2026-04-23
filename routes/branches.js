const express = require('express');
const router = express.Router();
const BranchService = require('../services/BranchService');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

router.post('/', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const { name, city, address, adminName, adminEmail } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, city, and address are required'
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
    console.error('Create branch controller error:', error);

    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while processing branch creation'
    });
  }
});

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
      message: 'A server error occurred while retrieving branch data'
    });
  }
});

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
      message: 'A server error occurred while retrieving branch details'
    });
  }
});

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
      message: 'A server error occurred while updating the branch'
    });
  }
});

module.exports = router;
