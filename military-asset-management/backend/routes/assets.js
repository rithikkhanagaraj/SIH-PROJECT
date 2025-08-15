const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetBalance
} = require('../controllers/assetController');
const {
  validateAsset,
  validateQuery
} = require('../middleware/validation');
const {
  authenticateToken,
  authorizeRoles,
  authorizeBaseAccess
} = require('../middleware/auth');
const { logAction } = require('../middleware/logging');

// All routes require authentication
router.use(authenticateToken);

// Get all assets (with filtering and pagination)
router.get('/', validateQuery, getAssets);

// Get single asset by ID
router.get('/:id', getAssetById);

// Get asset balance summary
router.get('/:id/balance', getAssetBalance);

// Create new asset (Admin and Logistics Officer only)
router.post('/', 
  authorizeRoles('Admin', 'Logistics Officer'), 
  validateAsset, 
  authorizeBaseAccess,
  logAction('CREATE_ASSET'),
  createAsset
);

// Update asset (Admin and Logistics Officer only)
router.put('/:id', 
  authorizeRoles('Admin', 'Logistics Officer'), 
  authorizeBaseAccess,
  logAction('UPDATE_ASSET'),
  updateAsset
);

// Delete asset (Admin only)
router.delete('/:id', 
  authorizeRoles('Admin'), 
  logAction('DELETE_ASSET'),
  deleteAsset
);

module.exports = router;