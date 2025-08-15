const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getBases,
  getAssetTypes
} = require('../controllers/dashboardController');
const {
  validateQuery
} = require('../middleware/validation');
const {
  authenticateToken
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get dashboard metrics
router.get('/metrics', validateQuery, getDashboardMetrics);

// Get available bases (for filter dropdown)
router.get('/bases', getBases);

// Get asset types (for filter dropdown)
router.get('/asset-types', getAssetTypes);

module.exports = router;