const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
} = require('../controllers/purchaseController');
const {
  validatePurchase,
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

// Get all purchases (with filtering and pagination)
router.get('/', validateQuery, getPurchases);

// Get single purchase by ID
router.get('/:id', getPurchaseById);

// Create new purchase (Admin and Logistics Officer only)
router.post('/', 
  authorizeRoles('Admin', 'Logistics Officer'), 
  validatePurchase, 
  authorizeBaseAccess,
  logAction('CREATE_PURCHASE'),
  createPurchase
);

// Update purchase (Admin and Logistics Officer only)
router.put('/:id', 
  authorizeRoles('Admin', 'Logistics Officer'), 
  authorizeBaseAccess,
  logAction('UPDATE_PURCHASE'),
  updatePurchase
);

// Delete purchase (Admin only)
router.delete('/:id', 
  authorizeRoles('Admin'), 
  logAction('DELETE_PURCHASE'),
  deletePurchase
);

module.exports = router;