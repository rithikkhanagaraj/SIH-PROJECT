const { pool } = require('../config/database');

// Get all assignments with filtering and pagination
const getAssignments = async (req, res) => {
  try {
    const { 
      base_id, 
      asset_id, 
      status,
      assigned_to,
      start_date, 
      end_date, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT ass.*, a.name as asset_name, a.type as asset_type, 
             b.name as base_name, u.name as user_name
      FROM assignments ass
      JOIN assets a ON ass.asset_id = a.id
      JOIN bases b ON ass.base_id = b.id
      LEFT JOIN users u ON ass.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      paramCount++;
      query += ` AND ass.base_id = $${paramCount}`;
      queryParams.push(req.user.base_id);
    } else if (base_id) {
      paramCount++;
      query += ` AND ass.base_id = $${paramCount}`;
      queryParams.push(base_id);
    }

    // Filter by asset
    if (asset_id) {
      paramCount++;
      query += ` AND ass.asset_id = $${paramCount}`;
      queryParams.push(asset_id);
    }

    // Filter by status
    if (status) {
      paramCount++;
      query += ` AND ass.status = $${paramCount}`;
      queryParams.push(status);
    }

    // Filter by assigned person
    if (assigned_to) {
      paramCount++;
      query += ` AND ass.assigned_to ILIKE $${paramCount}`;
      queryParams.push(`%${assigned_to}%`);
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      query += ` AND ass.date >= $${paramCount}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND ass.date <= $${paramCount}`;
      queryParams.push(end_date);
    }

    // Add ordering and pagination
    query += ' ORDER BY ass.date DESC, ass.created_at DESC';
    
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
      FROM assignments ass 
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'Base Commander') {
      countParamCount++;
      countQuery += ` AND ass.base_id = $${countParamCount}`;
      countParams.push(req.user.base_id);
    } else if (base_id) {
      countParamCount++;
      countQuery += ` AND ass.base_id = $${countParamCount}`;
      countParams.push(base_id);
    }

    if (asset_id) {
      countParamCount++;
      countQuery += ` AND ass.asset_id = $${countParamCount}`;
      countParams.push(asset_id);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND ass.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (assigned_to) {
      countParamCount++;
      countQuery += ` AND ass.assigned_to ILIKE $${countParamCount}`;
      countParams.push(`%${assigned_to}%`);
    }

    if (start_date) {
      countParamCount++;
      countQuery += ` AND ass.date >= $${countParamCount}`;
      countParams.push(start_date);
    }

    if (end_date) {
      countParamCount++;
      countQuery += ` AND ass.date <= $${countParamCount}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        assignments: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT ass.*, a.name as asset_name, a.type as asset_type, 
             b.name as base_name, u.name as user_name
      FROM assignments ass
      JOIN assets a ON ass.asset_id = a.id
      JOIN bases b ON ass.base_id = b.id
      LEFT JOIN users u ON ass.user_id = u.id
      WHERE ass.id = $1
    `;
    
    const queryParams = [id];

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      query += ' AND ass.base_id = $2';
      queryParams.push(req.user.base_id);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: {
        assignment: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new assignment
const createAssignment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { asset_id, assigned_to, quantity, date, base_id, notes } = req.body;
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

    // Create assignment record
    const assignmentResult = await client.query(
      'INSERT INTO assignments (asset_id, assigned_to, quantity, date, base_id, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [asset_id, assigned_to, quantity, date || new Date().toISOString().split('T')[0], base_id, user_id, notes]
    );

    const assignment = assignmentResult.rows[0];

    await client.query('COMMIT');

    // Get the complete assignment data with joins
    const completeResult = await pool.query(
      `SELECT ass.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM assignments ass
       JOIN assets a ON ass.asset_id = a.id
       JOIN bases b ON ass.base_id = b.id
       LEFT JOIN users u ON ass.user_id = u.id
       WHERE ass.id = $1`,
      [assignment.id]
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: {
        assignment: completeResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, quantity, date, status, notes } = req.body;

    // Get existing assignment
    let checkQuery = `
      SELECT ass.*, a.base_id as asset_base_id, a.quantity as asset_quantity
      FROM assignments ass
      JOIN assets a ON ass.asset_id = a.id
      WHERE ass.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND ass.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await pool.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const existingAssignment = existingResult.rows[0];

    // If quantity is being updated and assignment is active, check availability
    if (quantity && quantity !== existingAssignment.quantity && existingAssignment.status === 'Active') {
      const quantityDifference = quantity - existingAssignment.quantity;
      
      if (quantityDifference > 0) {
        // Get currently assigned quantity for this asset (excluding this assignment)
        const assignedResult = await pool.query(
          'SELECT COALESCE(SUM(quantity), 0) as total_assigned FROM assignments WHERE asset_id = $1 AND status = $2 AND id != $3',
          [existingAssignment.asset_id, 'Active', id]
        );

        const totalAssigned = parseInt(assignedResult.rows[0].total_assigned);
        const availableForAssignment = existingAssignment.asset_quantity - totalAssigned;

        if (availableForAssignment < quantityDifference) {
          return res.status(400).json({
            success: false,
            message: `Insufficient available quantity for increase. Available: ${availableForAssignment}, Requested increase: ${quantityDifference}`
          });
        }
      }
    }

    // Update assignment
    const result = await pool.query(
      'UPDATE assignments SET assigned_to = COALESCE($1, assigned_to), quantity = COALESCE($2, quantity), date = COALESCE($3, date), status = COALESCE($4, status), notes = COALESCE($5, notes) WHERE id = $6 RETURNING *',
      [assigned_to, quantity, date, status, notes, id]
    );

    // Get the complete updated assignment data
    const completeResult = await pool.query(
      `SELECT ass.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM assignments ass
       JOIN assets a ON ass.asset_id = a.id
       JOIN bases b ON ass.base_id = b.id
       LEFT JOIN users u ON ass.user_id = u.id
       WHERE ass.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: {
        assignment: completeResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Return assignment (set status to 'Returned')
const returnAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assignment exists and user has access
    let checkQuery = `
      SELECT ass.*, a.name as asset_name
      FROM assignments ass
      JOIN assets a ON ass.asset_id = a.id
      WHERE ass.id = $1 AND ass.status = 'Active'
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND ass.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await pool.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active assignment not found'
      });
    }

    // Update assignment status to 'Returned'
    await pool.query(
      'UPDATE assignments SET status = $1 WHERE id = $2',
      ['Returned', id]
    );

    // Get the complete updated assignment data
    const completeResult = await pool.query(
      `SELECT ass.*, a.name as asset_name, a.type as asset_type, 
              b.name as base_name, u.name as user_name
       FROM assignments ass
       JOIN assets a ON ass.asset_id = a.id
       JOIN bases b ON ass.base_id = b.id
       LEFT JOIN users u ON ass.user_id = u.id
       WHERE ass.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Assignment returned successfully',
      data: {
        assignment: completeResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Return assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assignment exists and user has access
    let checkQuery = `
      SELECT ass.*
      FROM assignments ass
      WHERE ass.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND ass.base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await pool.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Delete assignment
    await pool.query('DELETE FROM assignments WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  returnAssignment,
  deleteAssignment
};