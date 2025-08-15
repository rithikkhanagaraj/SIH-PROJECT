const express = require('express');
const router = express.Router();
const {
  getExpenditures,
  getExpenditureById,
  createExpenditure,
  updateExpenditure,
  deleteExpenditure
} = require('../controllers/expenditureController');
const {
  validateExpenditure,
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

// Get all expenditures (with filtering and pagination)
router.get('/', validateQuery, getExpenditures);

// Get single expenditure by ID
router.get('/:id', getExpenditureById);

// Create new expenditure
router.post('/', 
  validateExpenditure, 
  authorizeBaseAccess,
  logAction('CREATE_EXPENDITURE'),
  createExpenditure
);

// Update expenditure
router.put('/:id', 
  authorizeBaseAccess,
  logAction('UPDATE_EXPENDITURE'),
  updateExpenditure
);

// Delete expenditure (Admin only)
router.delete('/:id', 
  authorizeRoles('Admin'), 
  logAction('DELETE_EXPENDITURE'),
  deleteExpenditure
);

module.exports = router;