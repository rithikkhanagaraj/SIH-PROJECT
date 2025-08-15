const { pool } = require('../config/database');

// Get all transfers with filtering and pagination
const getTransfers = async (req, res) => {
  try {
    const { 
      base_id, 
      asset_id, 
      status,
      start_date, 
      end_date, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT t.*, a.name as asset_name, a.type as asset_type, 
             fb.name as from_base_name, tb.name as to_base_name,
             u.name as user_name
      FROM transfers t
      JOIN assets a ON t.asset_id = a.id
      JOIN bases fb ON t.from_base_id = fb.id
      JOIN bases tb ON t.to_base_id = tb.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      paramCount++;
      query += ` AND (t.from_base_id = $${paramCount} OR t.to_base_id = $${paramCount})`;
      queryParams.push(req.user.base_id);
    } else if (base_id) {
      paramCount++;
      query += ` AND (t.from_base_id = $${paramCount} OR t.to_base_id = $${paramCount})`;
      queryParams.push(base_id);
    }

    // Filter by asset
    if (asset_id) {
      paramCount++;
      query += ` AND t.asset_id = $${paramCount}`;
      queryParams.push(asset_id);
    }

    // Filter by status
    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      queryParams.push(status);
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      query += ` AND t.date >= $${paramCount}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND t.date <= $${paramCount}`;
      queryParams.push(end_date);
    }

    // Add ordering and pagination
    query += ' ORDER BY t.date DESC, t.created_at DESC';
    
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
      FROM transfers t 
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'Base Commander') {
      countParamCount++;
      countQuery += ` AND (t.from_base_id = $${countParamCount} OR t.to_base_id = $${countParamCount})`;
      countParams.push(req.user.base_id);
    } else if (base_id) {
      countParamCount++;
      countQuery += ` AND (t.from_base_id = $${countParamCount} OR t.to_base_id = $${countParamCount})`;
      countParams.push(base_id);
    }

    if (asset_id) {
      countParamCount++;
      countQuery += ` AND t.asset_id = $${countParamCount}`;
      countParams.push(asset_id);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND t.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (start_date) {
      countParamCount++;
      countQuery += ` AND t.date >= $${countParamCount}`;
      countParams.push(start_date);
    }

    if (end_date) {
      countParamCount++;
      countQuery += ` AND t.date <= $${countParamCount}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        transfers: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single transfer by ID
const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT t.*, a.name as asset_name, a.type as asset_type, 
             fb.name as from_base_name, tb.name as to_base_name,
             u.name as user_name
      FROM transfers t
      JOIN assets a ON t.asset_id = a.id
      JOIN bases fb ON t.from_base_id = fb.id
      JOIN bases tb ON t.to_base_id = tb.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    
    const queryParams = [id];

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      query += ' AND (t.from_base_id = $2 OR t.to_base_id = $2)';
      queryParams.push(req.user.base_id);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    res.json({
      success: true,
      data: {
        transfer: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new transfer
const createTransfer = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { asset_id, from_base_id, to_base_id, quantity, date, notes } = req.body;
    const user_id = req.user.id;

    // Check base access for Base Commanders
    if (req.user.role === 'Base Commander') {
      if (req.user.base_id !== parseInt(from_base_id) && req.user.base_id !== parseInt(to_base_id)) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only create transfers involving your base'
        });
      }
    }

    // Verify asset exists at the from_base
    const assetResult = await client.query(
      'SELECT * FROM assets WHERE id = $1',
      [asset_id]
    );

    if (assetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if there's enough quantity at the source base
    const sourceAssetResult = await client.query(
      'SELECT quantity FROM assets WHERE id = $1 AND base_id = $2',
      [asset_id, from_base_id]
    );

    if (sourceAssetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Asset not found at source base'
      });
    }

    if (sourceAssetResult.rows[0].quantity < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity at source base'
      });
    }

    // Verify both bases exist
    const basesResult = await client.query(
      'SELECT id FROM bases WHERE id IN ($1, $2)',
      [from_base_id, to_base_id]
    );

    if (basesResult.rows.length !== 2) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'One or both bases not found'
      });
    }

    // Create transfer record
    const transferResult = await client.query(
      'INSERT INTO transfers (asset_id, from_base_id, to_base_id, quantity, date, user_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [asset_id, from_base_id, to_base_id, quantity, date || new Date().toISOString().split('T')[0], user_id, notes]
    );

    const transfer = transferResult.rows[0];

    // Update asset quantity at source base (reduce)
    await client.query(
      'UPDATE assets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND base_id = $3',
      [quantity, asset_id, from_base_id]
    );

    // Check if asset exists at destination base
    const destAssetResult = await client.query(
      'SELECT id FROM assets WHERE name = $1 AND base_id = $2',
      [assetResult.rows[0].name, to_base_id]
    );

    if (destAssetResult.rows.length === 0) {
      // Create asset at destination base
      await client.query(
        'INSERT INTO assets (name, type, quantity, base_id) VALUES ($1, $2, $3, $4)',
        [assetResult.rows[0].name, assetResult.rows[0].type, quantity, to_base_id]
      );
    } else {
      // Update existing asset at destination base (increase)
      await client.query(
        'UPDATE assets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, destAssetResult.rows[0].id]
      );
    }

    // Mark transfer as completed
    await client.query(
      'UPDATE transfers SET status = $1 WHERE id = $2',
      ['Completed', transfer.id]
    );

    await client.query('COMMIT');

    // Get the complete transfer data with joins
    const completeResult = await pool.query(
      `SELECT t.*, a.name as asset_name, a.type as asset_type, 
              fb.name as from_base_name, tb.name as to_base_name,
              u.name as user_name
       FROM transfers t
       JOIN assets a ON t.asset_id = a.id
       JOIN bases fb ON t.from_base_id = fb.id
       JOIN bases tb ON t.to_base_id = tb.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [transfer.id]
    );

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        transfer: completeResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

// Update transfer status
const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if transfer exists and user has access
    let checkQuery = `
      SELECT t.*, a.name as asset_name
      FROM transfers t
      JOIN assets a ON t.asset_id = a.id
      WHERE t.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND (t.from_base_id = $2 OR t.to_base_id = $2)';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await pool.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Update transfer status
    const result = await pool.query(
      'UPDATE transfers SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Get the complete updated transfer data
    const completeResult = await pool.query(
      `SELECT t.*, a.name as asset_name, a.type as asset_type, 
              fb.name as from_base_name, tb.name as to_base_name,
              u.name as user_name
       FROM transfers t
       JOIN assets a ON t.asset_id = a.id
       JOIN bases fb ON t.from_base_id = fb.id
       JOIN bases tb ON t.to_base_id = tb.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Transfer status updated successfully',
      data: {
        transfer: completeResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Update transfer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete transfer (only if pending)
const deleteTransfer = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Get existing transfer
    let checkQuery = `
      SELECT t.*, a.name as asset_name, a.type as asset_type
      FROM transfers t
      JOIN assets a ON t.asset_id = a.id
      WHERE t.id = $1
    `;
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND (t.from_base_id = $2 OR t.to_base_id = $2)';
      checkParams.push(req.user.base_id);
    }

    const existingResult = await client.query(checkQuery, checkParams);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    const existingTransfer = existingResult.rows[0];

    if (existingTransfer.status === 'Completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed transfers'
      });
    }

    // If transfer was in progress, reverse the asset movements
    if (existingTransfer.status === 'In Transit') {
      // Restore quantity to source base
      await client.query(
        'UPDATE assets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2 AND base_id = $3',
        [existingTransfer.quantity, existingTransfer.asset_name, existingTransfer.from_base_id]
      );

      // Remove quantity from destination base
      await client.query(
        'UPDATE assets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2 AND base_id = $3',
        [existingTransfer.quantity, existingTransfer.asset_name, existingTransfer.to_base_id]
      );
    }

    // Delete transfer
    await client.query('DELETE FROM transfers WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transfer deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus,
  deleteTransfer
};