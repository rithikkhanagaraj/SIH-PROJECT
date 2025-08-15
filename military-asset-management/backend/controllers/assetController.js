const { pool } = require('../config/database');

// Get all assets with filtering and pagination
const getAssets = async (req, res) => {
  try {
    const { 
      base_id, 
      type, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = `
      SELECT a.*, b.name as base_name, b.location as base_location
      FROM assets a
      JOIN bases b ON a.base_id = b.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      paramCount++;
      query += ` AND a.base_id = $${paramCount}`;
      queryParams.push(req.user.base_id);
    } else if (base_id) {
      paramCount++;
      query += ` AND a.base_id = $${paramCount}`;
      queryParams.push(base_id);
    }

    // Filter by type
    if (type) {
      paramCount++;
      query += ` AND a.type = $${paramCount}`;
      queryParams.push(type);
    }

    // Add ordering and pagination
    query += ' ORDER BY a.name ASC';
    
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
      FROM assets a 
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'Base Commander') {
      countParamCount++;
      countQuery += ` AND a.base_id = $${countParamCount}`;
      countParams.push(req.user.base_id);
    } else if (base_id) {
      countParamCount++;
      countQuery += ` AND a.base_id = $${countParamCount}`;
      countParams.push(base_id);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND a.type = $${countParamCount}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        assets: result.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single asset by ID
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT a.*, b.name as base_name, b.location as base_location
      FROM assets a
      JOIN bases b ON a.base_id = b.id
      WHERE a.id = $1
    `;
    
    const queryParams = [id];

    // Apply base access control
    if (req.user.role === 'Base Commander') {
      query += ' AND a.base_id = $2';
      queryParams.push(req.user.base_id);
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: {
        asset: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new asset
const createAsset = async (req, res) => {
  try {
    const { name, type, quantity, base_id } = req.body;

    // Check if base exists
    const baseResult = await pool.query(
      'SELECT id FROM bases WHERE id = $1',
      [base_id]
    );

    if (baseResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Base not found'
      });
    }

    // Check if asset with same name exists at this base
    const existingAsset = await pool.query(
      'SELECT id FROM assets WHERE name = $1 AND base_id = $2',
      [name, base_id]
    );

    if (existingAsset.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Asset with this name already exists at this base'
      });
    }

    // Create asset
    const result = await pool.query(
      'INSERT INTO assets (name, type, quantity, base_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, type, quantity, base_id]
    );

    const asset = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: {
        asset
      }
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update asset
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, quantity } = req.body;

    // Check if asset exists and user has access
    let checkQuery = 'SELECT * FROM assets WHERE id = $1';
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingAsset = await pool.query(checkQuery, checkParams);

    if (existingAsset.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const asset = existingAsset.rows[0];

    // Check for duplicate name if name is being changed
    if (name && name !== asset.name) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM assets WHERE name = $1 AND base_id = $2 AND id != $3',
        [name, asset.base_id, id]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Asset with this name already exists at this base'
        });
      }
    }

    // Update asset
    const result = await pool.query(
      'UPDATE assets SET name = COALESCE($1, name), type = COALESCE($2, type), quantity = COALESCE($3, quantity), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, type, quantity, id]
    );

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: {
        asset: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete asset
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if asset exists and user has access
    let checkQuery = 'SELECT * FROM assets WHERE id = $1';
    const checkParams = [id];

    if (req.user.role === 'Base Commander') {
      checkQuery += ' AND base_id = $2';
      checkParams.push(req.user.base_id);
    }

    const existingAsset = await pool.query(checkQuery, checkParams);

    if (existingAsset.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset has related transactions
    const relatedTransactions = await pool.query(
      'SELECT COUNT(*) as count FROM (SELECT id FROM purchases WHERE asset_id = $1 UNION SELECT id FROM transfers WHERE asset_id = $1 UNION SELECT id FROM assignments WHERE asset_id = $1 UNION SELECT id FROM expenditures WHERE asset_id = $1) as transactions',
      [id]
    );

    if (parseInt(relatedTransactions.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete asset with existing transactions. Set quantity to 0 instead.'
      });
    }

    // Delete asset
    await pool.query('DELETE FROM assets WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get asset balance summary
const getAssetBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    // Check if asset exists and user has access
    let assetQuery = `
      SELECT a.*, b.name as base_name 
      FROM assets a 
      JOIN bases b ON a.base_id = b.id 
      WHERE a.id = $1
    `;
    const assetParams = [id];

    if (req.user.role === 'Base Commander') {
      assetQuery += ' AND a.base_id = $2';
      assetParams.push(req.user.base_id);
    }

    const assetResult = await pool.query(assetQuery, assetParams);

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const asset = assetResult.rows[0];

    // Build date filter
    let dateFilter = '';
    let dateParams = [];
    let paramCount = 1;

    if (start_date) {
      dateFilter += ` AND date >= $${paramCount}`;
      dateParams.push(start_date);
      paramCount++;
    }

    if (end_date) {
      dateFilter += ` AND date <= $${paramCount}`;
      dateParams.push(end_date);
      paramCount++;
    }

    // Calculate purchases
    const purchasesResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM purchases WHERE asset_id = $1${dateFilter}`,
      [id, ...dateParams]
    );

    // Calculate transfers in
    const transfersInResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE asset_id = $1 AND to_base_id = $2 AND status = 'Completed'${dateFilter}`,
      [id, asset.base_id, ...dateParams]
    );

    // Calculate transfers out
    const transfersOutResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE asset_id = $1 AND from_base_id = $2 AND status = 'Completed'${dateFilter}`,
      [id, asset.base_id, ...dateParams]
    );

    // Calculate assignments (active)
    const assignmentsResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM assignments WHERE asset_id = $1 AND status = 'Active'${dateFilter}`,
      [id, ...dateParams]
    );

    // Calculate expenditures
    const expendituresResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures WHERE asset_id = $1${dateFilter}`,
      [id, ...dateParams]
    );

    const purchases = parseInt(purchasesResult.rows[0].total);
    const transfersIn = parseInt(transfersInResult.rows[0].total);
    const transfersOut = parseInt(transfersOutResult.rows[0].total);
    const assignments = parseInt(assignmentsResult.rows[0].total);
    const expenditures = parseInt(expendituresResult.rows[0].total);

    const netMovement = purchases + transfersIn - transfersOut;
    const availableQuantity = asset.quantity - assignments;

    res.json({
      success: true,
      data: {
        asset: {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          base_name: asset.base_name
        },
        balance: {
          opening_balance: asset.quantity - netMovement + expenditures,
          current_quantity: asset.quantity,
          available_quantity: availableQuantity,
          assigned_quantity: assignments,
          purchases: purchases,
          transfers_in: transfersIn,
          transfers_out: transfersOut,
          expenditures: expenditures,
          net_movement: netMovement
        },
        date_range: {
          start_date: start_date || null,
          end_date: end_date || null
        }
      }
    });
  } catch (error) {
    console.error('Get asset balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetBalance
};