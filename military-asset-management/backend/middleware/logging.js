const { pool } = require('../config/database');

// Middleware to log all API actions for audit trail
const logAction = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logToDatabase(action, req, data);
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Function to log actions to database
const logToDatabase = async (action, req, responseData) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Prepare details object with request information
    const details = {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: sanitizeBody(req.body), // Remove sensitive data
      response: sanitizeResponse(responseData)
    };

    await pool.query(
      'INSERT INTO logs (action, user_id, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [action, userId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging action:', error);
    // Don't throw error to prevent breaking the main request
  }
};

// Remove sensitive information from request body
const sanitizeBody = (body) => {
  if (!body) return body;
  
  const sanitized = { ...body };
  
  // Remove password fields
  if (sanitized.password) delete sanitized.password;
  if (sanitized.password_hash) delete sanitized.password_hash;
  if (sanitized.confirmPassword) delete sanitized.confirmPassword;
  
  return sanitized;
};

// Remove sensitive information from response data
const sanitizeResponse = (data) => {
  if (!data) return data;
  
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (parsed && typeof parsed === 'object') {
      const sanitized = { ...parsed };
      
      // Remove token and password information
      if (sanitized.token) delete sanitized.token;
      if (sanitized.password_hash) delete sanitized.password_hash;
      
      // If it's a user object or contains user data, sanitize it
      if (sanitized.user && sanitized.user.password_hash) {
        delete sanitized.user.password_hash;
      }
      
      return sanitized;
    }
    
    return parsed;
  } catch (error) {
    return data;
  }
};

// Middleware to log authentication attempts
const logAuthAttempt = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const action = req.originalUrl.includes('login') ? 'LOGIN_ATTEMPT' : 'REGISTER_ATTEMPT';
    const success = res.statusCode >= 200 && res.statusCode < 300;
    
    logAuthToDatabase(action, req, success);
    originalSend.call(this, data);
  };
  
  next();
};

// Function to log authentication attempts
const logAuthToDatabase = async (action, req, success) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const details = {
      email: req.body.email,
      success: success,
      method: req.method,
      url: req.originalUrl
    };

    await pool.query(
      'INSERT INTO logs (action, user_id, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [action, null, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Error logging auth attempt:', error);
  }
};

module.exports = {
  logAction,
  logAuthAttempt
};