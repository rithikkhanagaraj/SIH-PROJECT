const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database to ensure user still exists
    const result = await pool.query(
      'SELECT id, name, email, role, base_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Middleware to check base access (for Base Commanders)
const authorizeBaseAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin has access to all bases
  if (req.user.role === 'Admin') {
    return next();
  }

  // Base Commander can only access their own base
  if (req.user.role === 'Base Commander') {
    const requestedBaseId = req.params.baseId || req.body.base_id || req.query.base_id;
    
    if (requestedBaseId && parseInt(requestedBaseId) !== req.user.base_id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied to this base' 
      });
    }
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeBaseAccess
};