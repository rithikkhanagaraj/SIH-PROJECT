const express = require('express');
const router = express.Router();
const {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus,
  deleteTransfer
} = require('../controllers/transferController');
const {
  validateTransfer,
  validateQuery
} = require('../middleware/validation');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');
const { logAction } = require('../middleware/logging');

// All routes require authentication
router.use(authenticateToken);

// Get all transfers (with filtering and pagination)
router.get('/', validateQuery, getTransfers);

// Get single transfer by ID
router.get('/:id', getTransferById);

// Create new transfer (Admin and Logistics Officer only)
router.post('/', 
  authorizeRoles('Admin', 'Logistics Officer'), 
  validateTransfer, 
  logAction('CREATE_TRANSFER'),
  createTransfer
);

// Update transfer status (Admin and Logistics Officer only)
router.put('/:id/status', 
  authorizeRoles('Admin', 'Logistics Officer'), 
  logAction('UPDATE_TRANSFER_STATUS'),
  updateTransferStatus
);

// Delete transfer (Admin only)
router.delete('/:id', 
  authorizeRoles('Admin'), 
  logAction('DELETE_TRANSFER'),
  deleteTransfer
);

module.exports = router;