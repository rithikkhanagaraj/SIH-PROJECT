const { pool } = require('../config/database');

// Get all expenditures with filtering and pagination
const getExpenditures = async (req, res) => {
  try {
    const { 
      base_id, 
      asset_id, 
      reason,
      start_date, 
      end_date, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT e.*, a.name as asset_name, a.type as asset_type, 
             b.name as base_name, u.name as user_name
      FROM expenditures e
      JOIN assets a ON e.asset_id = a.id
      JOIN bases b ON e.base_id = b.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      paramCount++;
      query += ` AND e.base_id = $${paramCount}`;
      queryParams.push(req.user.base_id);
    } else if (base_id) {
      paramCount++;
      query += ` AND e.base_id = $${paramCount}`;
      queryParams.push(base_id);
    }

    // Filter by asset
    if (asset_id) {
      paramCount++;
      query += ` AND e.asset_id = $${paramCount}`;
      queryParams.push(asset_id);
    }

    // Filter by reason
    if (reason) {
      paramCount++;
      query += ` AND e.reason ILIKE $${paramCount}`;
      queryParams.push(`%${reason}%`);
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      query += ` AND e.date >= $${paramCount}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND e.date <= $${paramCount}`;
      queryParams.push(end_date);
    }

    // Add ordering and pagination
    query += ' ORDER BY e.date DESC, e.created_at DESC';
    
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
      FROM expenditures e 
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'Base Commander') {
      countParamCount++;
      countQuery += ` AND e.base_id = $${countParamCount}`;
      countParams.push(req.user.base_id);
    } else if (base_id) {
      countParamCount++;
      countQuery += ` AND e.base_id = $${countParamCount}`;
      countParams.push(base_id);
    }

    if (asset_id) {
      countParamCount++;
      countQuery += ` AND e.asset_id = $${countParamCount}`;
      countParams.push(asset_id);
    }

    if (reason) {
      countParamCount++;
      countQuery += ` AND e.reason ILIKE $${countParamCount}`;
      countParams.push(`%${reason}%`);
    }

    if (start_date) {
      countParamCount++;
      countQuery += ` AND e.date >= $${countParamCount}`;
      countParams.push(start_date);
    }

    if (end_date) {
      countParamCount++;
      countQuery += ` AND e.date <= $${countParamCount}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        expenditures: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expenditures error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single expenditure by ID
const getExpenditureById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT e.*, a.name as asset_name, a.type as asset_type, 
             b.name as base_name, u.name as user_name
      FROM expenditures e
      JOIN assets a ON e.asset_id = a.id
      JOIN bases b ON e.base_id = b.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = $1
    `;
    
    const queryParams = [id];

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      query += ' AND e.base_id = $2';
      queryParams.push(req.user.base_id);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    res.json({
      success: true,
      data: {
        expenditure: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new expenditure
const createExpenditure = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { asset_id, quantity, date, base_id, reason, notes } = req.body;
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

    const asset = assetResult.rows[0];

    // Check base access for Base Commanders
    if (req.user.role === 'Base Commander' && req.user.base_id !== parseInt(base_id)) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Access denied to this base'
      });
    }

    // Check if there's enough available quantity
    const availableQuantity = asset.quantity;
    
    // Get currently assigned quantity for this asset
    const assignedResult = await client.query(
      'SELECT COALESCE(SUM(quantity), 0) as total_assigned FROM assignments WHERE asset_id = $1 AND status = $2',
      [asset_id, 'Active']
    );

    const totalAssigned = parseInt(assignedResult.rows[0].total_assigned);
    const actualAvailable = availableQuantity - totalAssigned;

    if (actualAvailable < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Insufficient available quantity. Available: ${actualAvailable}, Requested: ${quantity}`
      });
    }

    // Create expenditure record
    const expenditureResult = await client.query(
      'INSERT INTO expenditures (asset_id, quantity, date, base_id, user_id, reason, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [asset_id, quantity, date || new Date().toISOString().split('T')[0], base_id, user_id, reason, notes]
    );

    const expenditure = expenditureResult.rows[0];

    // Update asset quantity (reduce)
    await client.query(
      'UPDATE assets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, asset_id]
    );

    await client.query('COMMIT');

    // Get the complete expenditure data with joins
    const completeResult = await pool.query(
      `SELECT e.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM expenditures e
       JOIN assets a ON e.asset_id = a.id
       JOIN bases b ON e.base_id = b.id
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = $1`,
      [expenditure.id]
    );

    res.status(201).json({
      success: true,
      message: 'Expenditure recorded successfully',
      data: {
        expenditure: completeResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

// Update expenditure
const updateExpenditure = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { quantity, date, reason, notes } = req.body;

    // Get existing expenditure
    let checkQuery = `
      SELECT e.*, a.base_id as asset_base_id, a.quantity as current_asset_quantity
      FROM expenditures e
      JOIN assets a ON e.asset_id = a.id
      WHERE e.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND e.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await client.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    const existingExpenditure = existingResult.rows[0];

    // If quantity is being updated, adjust asset quantity
    if (quantity && quantity !== existingExpenditure.quantity) {
      const quantityDifference = quantity - existingExpenditure.quantity;
      
      // Check if we have enough quantity to support the increase
      if (quantityDifference > 0) {
        // Get currently assigned quantity for this asset
        const assignedResult = await client.query(
          'SELECT COALESCE(SUM(quantity), 0) as total_assigned FROM assignments WHERE asset_id = $1 AND status = $2',
          [existingExpenditure.asset_id, 'Active']
        );

        const totalAssigned = parseInt(assignedResult.rows[0].total_assigned);
        const actualAvailable = existingExpenditure.current_asset_quantity - totalAssigned;

        if (actualAvailable < quantityDifference) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient available quantity for increase. Available: ${actualAvailable}, Requested increase: ${quantityDifference}`
          });
        }
      }
      
      // Update asset quantity (negative quantityDifference means we're reducing expenditure, so asset quantity increases)
      await client.query(
        'UPDATE assets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantityDifference, existingExpenditure.asset_id]
      );
    }

    // Update expenditure
    const result = await client.query(
      'UPDATE expenditures SET quantity = COALESCE($1, quantity), date = COALESCE($2, date), reason = COALESCE($3, reason), notes = COALESCE($4, notes) WHERE id = $5 RETURNING *',
      [quantity, date, reason, notes, id]
    );

    await client.query('COMMIT');

    // Get the complete updated expenditure data
    const completeResult = await pool.query(
      `SELECT e.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM expenditures e
       JOIN assets a ON e.asset_id = a.id
       JOIN bases b ON e.base_id = b.id
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Expenditure updated successfully',
      data: {
        expenditure: completeResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

// Delete expenditure
const deleteExpenditure = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Get existing expenditure
    let checkQuery = `
      SELECT e.*, a.base_id as asset_base_id
      FROM expenditures e
      JOIN assets a ON e.asset_id = a.id
      WHERE e.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND e.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await client.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    const existingExpenditure = existingResult.rows[0];

    // Reverse the asset quantity change (add back the expended quantity)
    await client.query(
      'UPDATE assets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [existingExpenditure.quantity, existingExpenditure.asset_id]
    );

    // Delete expenditure
    await client.query('DELETE FROM expenditures WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Expenditure deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getExpenditures,
  getExpenditureById,
  createExpenditure,
  updateExpenditure,
  deleteExpenditure
};