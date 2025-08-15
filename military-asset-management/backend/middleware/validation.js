const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // User registration validation
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Base Commander', 'Logistics Officer').required(),
    base_id: Joi.number().integer().positive().when('role', {
      is: Joi.string().valid('Base Commander', 'Logistics Officer'),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // User login validation
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Base validation
  base: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    location: Joi.string().min(2).max(200).required()
  }),

  // Asset validation
  asset: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('Vehicle', 'Weapon', 'Ammunition', 'Equipment').required(),
    quantity: Joi.number().integer().min(0).required(),
    base_id: Joi.number().integer().positive().required()
  }),

  // Purchase validation
  purchase: Joi.object({
    asset_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
    date: Joi.date().iso().optional(),
    base_id: Joi.number().integer().positive().required(),
    notes: Joi.string().max(500).optional()
  }),

  // Transfer validation
  transfer: Joi.object({
    asset_id: Joi.number().integer().positive().required(),
    from_base_id: Joi.number().integer().positive().required(),
    to_base_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
    date: Joi.date().iso().optional(),
    notes: Joi.string().max(500).optional()
  }).custom((value, helpers) => {
    if (value.from_base_id === value.to_base_id) {
      return helpers.error('custom.sameBase');
    }
    return value;
  }, 'Different bases validation').messages({
    'custom.sameBase': 'Source and destination bases must be different'
  }),

  // Assignment validation
  assignment: Joi.object({
    asset_id: Joi.number().integer().positive().required(),
    assigned_to: Joi.string().min(2).max(100).required(),
    quantity: Joi.number().integer().positive().required(),
    date: Joi.date().iso().optional(),
    base_id: Joi.number().integer().positive().required(),
    notes: Joi.string().max(500).optional()
  }),

  // Expenditure validation
  expenditure: Joi.object({
    asset_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
    date: Joi.date().iso().optional(),
    base_id: Joi.number().integer().positive().required(),
    reason: Joi.string().max(200).optional(),
    notes: Joi.string().max(500).optional()
  }),

  // Update asset quantity validation
  updateAssetQuantity: Joi.object({
    quantity: Joi.number().integer().min(0).required()
  }),

  // Query parameters validation for filtering
  queryFilters: Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    base_id: Joi.number().integer().positive().optional(),
    type: Joi.string().valid('Vehicle', 'Weapon', 'Ammunition', 'Equipment').optional(),
    status: Joi.string().optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  })
};

// Validation middleware functions
const validateRegister = validate(schemas.register);
const validateLogin = validate(schemas.login);
const validateBase = validate(schemas.base);
const validateAsset = validate(schemas.asset);
const validatePurchase = validate(schemas.purchase);
const validateTransfer = validate(schemas.transfer);
const validateAssignment = validate(schemas.assignment);
const validateExpenditure = validate(schemas.expenditure);
const validateUpdateAssetQuantity = validate(schemas.updateAssetQuantity);

// Query validation middleware
const validateQuery = (req, res, next) => {
  const { error } = schemas.queryFilters.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateBase,
  validateAsset,
  validatePurchase,
  validateTransfer,
  validateAssignment,
  validateExpenditure,
  validateUpdateAssetQuantity,
  validateQuery
};