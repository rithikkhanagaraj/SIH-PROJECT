const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  returnAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const {
  validateAssignment,
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

// Get all assignments (with filtering and pagination)
router.get('/', validateQuery, getAssignments);

// Get single assignment by ID
router.get('/:id', getAssignmentById);

// Create new assignment
router.post('/', 
  validateAssignment, 
  authorizeBaseAccess,
  logAction('CREATE_ASSIGNMENT'),
  createAssignment
);

// Update assignment
router.put('/:id', 
  authorizeBaseAccess,
  logAction('UPDATE_ASSIGNMENT'),
  updateAssignment
);

// Return assignment (set status to 'Returned')
router.put('/:id/return', 
  authorizeBaseAccess,
  logAction('RETURN_ASSIGNMENT'),
  returnAssignment
);

// Delete assignment (Admin only)
router.delete('/:id', 
  authorizeRoles('Admin'), 
  logAction('DELETE_ASSIGNMENT'),
  deleteAssignment
);

module.exports = router;