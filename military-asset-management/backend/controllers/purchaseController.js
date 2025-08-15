const { pool } = require('../config/database');

// Get all purchases with filtering and pagination
const getPurchases = async (req, res) => {
  try {
    const { 
      base_id, 
      asset_id, 
      start_date, 
      end_date, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT p.*, a.name as asset_name, a.type as asset_type, 
             b.name as base_name, u.name as user_name
      FROM purchases p
      JOIN assets a ON p.asset_id = a.id
      JOIN bases b ON p.base_id = b.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      paramCount++;
      query += ` AND p.base_id = $${paramCount}`;
      queryParams.push(req.user.base_id);
    } else if (base_id) {
      paramCount++;
      query += ` AND p.base_id = $${paramCount}`;
      queryParams.push(base_id);
    }

    // Filter by asset
    if (asset_id) {
      paramCount++;
      query += ` AND p.asset_id = $${paramCount}`;
      queryParams.push(asset_id);
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      query += ` AND p.date >= $${paramCount}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND p.date <= $${paramCount}`;
      queryParams.push(end_date);
    }

    // Add ordering and pagination
    query += ' ORDER BY p.date DESC, p.created_at DESC';
    
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM purchases p 
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'Base Commander') {
      countParamCount++;
      countQuery += ` AND p.base_id = $${countParamCount}`;
      countParams.push(req.user.base_id);
    } else if (base_id) {
      countParamCount++;
      countQuery += ` AND p.base_id = $${countParamCount}`;
      countParams.push(base_id);
    }

    if (asset_id) {
      countParamCount++;
      countQuery += ` AND p.asset_id = $${countParamCount}`;
      countParams.push(asset_id);
    }

    if (start_date) {
      countParamCount++;
      countQuery += ` AND p.date >= $${countParamCount}`;
      countParams.push(start_date);
    }

    if (end_date) {
      countParamCount++;
      countQuery += ` AND p.date <= $${countParamCount}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        purchases: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single purchase by ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT p.*, a.name as asset_name, a.type as asset_type, 
             b.name as base_name, u.name as user_name
      FROM purchases p
      JOIN assets a ON p.asset_id = a.id
      JOIN bases b ON p.base_id = b.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    
    const queryParams = [id];

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      query += ' AND p.base_id = $2';
      queryParams.push(req.user.base_id);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: {
        purchase: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new purchase
const createPurchase = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { asset_id, quantity, date, base_id, notes } = req.body;
    const user_id = req.user.id;

    // Verify asset exists and belongs to the specified base
    const assetResult = await client.query(
      'SELECT * FROM assets WHERE id = $1 AND base_id = $2',
      [asset_id, base_id]
    );

    if (assetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Asset not found at the specified base'
      });
    }

    // Check base access for Base Commanders
    if (req.user.role === 'Base Commander' && req.user.base_id !== parseInt(base_id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied to this base'
      });
    }

    // Create purchase record
    const purchaseResult = await client.query(
      'INSERT INTO purchases (asset_id, quantity, date, base_id, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [asset_id, quantity, date || new Date().toISOString().split('T')[0], base_id, user_id, notes]
    );

    const purchase = purchaseResult.rows[0];

    // Update asset quantity
    await client.query(
      'UPDATE assets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, asset_id]
    );

    await client.query('COMMIT');

    // Get the complete purchase data with joins
    const completeResult = await pool.query(
      `SELECT p.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM purchases p
       JOIN assets a ON p.asset_id = a.id
       JOIN bases b ON p.base_id = b.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [purchase.id]
    );

    res.status(201).json({
      success: true,
      message: 'Purchase recorded successfully',
      data: {
        purchase: completeResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

// Update purchase
const updatePurchase = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { quantity, date, notes } = req.body;

    // Get existing purchase
    let checkQuery = `
      SELECT p.*, a.base_id as asset_base_id
      FROM purchases p
      JOIN assets a ON p.asset_id = a.id
      WHERE p.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND p.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await client.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    const existingPurchase = existingResult.rows[0];

    // If quantity is being updated, adjust asset quantity
    if (quantity && quantity !== existingPurchase.quantity) {
      const quantityDifference = quantity - existingPurchase.quantity;
      
      await client.query(
        'UPDATE assets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantityDifference, existingPurchase.asset_id]
      );
    }

    // Update purchase
    const result = await client.query(
      'UPDATE purchases SET quantity = COALESCE($1, quantity), date = COALESCE($2, date), notes = COALESCE($3, notes) WHERE id = $4 RETURNING *',
      [quantity, date, notes, id]
    );

    await client.query('COMMIT');

    // Get the complete updated purchase data
    const completeResult = await pool.query(
      `SELECT p.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM purchases p
       JOIN assets a ON p.asset_id = a.id
       JOIN bases b ON p.base_id = b.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Purchase updated successfully',
      data: {
        purchase: completeResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

// Delete purchase
const deletePurchase = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Get existing purchase
    let checkQuery = `
      SELECT p.*, a.base_id as asset_base_id
      FROM purchases p
      JOIN assets a ON p.asset_id = a.id
      WHERE p.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND p.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await client.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    const existingPurchase = existingResult.rows[0];

    // Reverse the asset quantity change
    await client.query(
      'UPDATE assets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [existingPurchase.quantity, existingPurchase.asset_id]
    );

    // Delete purchase
    await client.query('DELETE FROM purchases WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Purchase deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
};