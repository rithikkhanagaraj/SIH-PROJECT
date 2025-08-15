const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');
const { 
  validateRegister, 
  validateLogin 
} = require('../middleware/validation');
const { 
  authenticateToken 
} = require('../middleware/auth');
const { 
  logAuthAttempt 
} = require('../middleware/logging');

// Public routes
router.post('/register', validateRegister, logAuthAttempt, register);
router.post('/login', validateLogin, logAuthAttempt, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;