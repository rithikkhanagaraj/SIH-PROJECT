const { pool } = require('../config/database');

// Get dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const { base_id, start_date, end_date, type } = req.query;

    // Build base query filters based on user role
    let baseFilter = '';
    let filterParams = [];
    let paramCount = 0;

    if (req.user.role === 'Base Commander') {
      paramCount++;
      baseFilter = ` AND base_id = $${paramCount}`;
      filterParams.push(req.user.base_id);
    } else if (base_id) {
      paramCount++;
      baseFilter = ` AND base_id = $${paramCount}`;
      filterParams.push(base_id);
    }

    // Add type filter
    let typeFilter = '';
    if (type) {
      paramCount++;
      typeFilter = ` AND type = $${paramCount}`;
      filterParams.push(type);
    }

    // Add date filter
    let dateFilter = '';
    if (start_date) {
      paramCount++;
      dateFilter += ` AND date >= $${paramCount}`;
      filterParams.push(start_date);
    }
    if (end_date) {
      paramCount++;
      dateFilter += ` AND date <= $${paramCount}`;
      filterParams.push(end_date);
    }

    // Get asset summary
    const assetSummaryQuery = `
      SELECT 
        COUNT(*) as total_assets,
        SUM(quantity) as total_quantity,
        type,
        COUNT(*) FILTER (WHERE quantity > 0) as assets_with_stock,
        COUNT(*) FILTER (WHERE quantity = 0) as assets_out_of_stock
      FROM assets 
      WHERE 1=1 ${baseFilter} ${typeFilter}
      GROUP BY type
      ORDER BY type
    `;

    const assetSummary = await pool.query(assetSummaryQuery, filterParams.slice(0, paramCount - (dateFilter ? (end_date ? 2 : 1) : 0)));

    // Calculate overall totals
    let overallQuery = `
      SELECT 
        COUNT(*) as total_assets,
        SUM(quantity) as total_quantity,
        COUNT(*) FILTER (WHERE quantity > 0) as assets_with_stock,
        COUNT(*) FILTER (WHERE quantity = 0) as assets_out_of_stock
      FROM assets 
      WHERE 1=1 ${baseFilter}
    `;

    const overallParams = filterParams.slice(0, req.user.role === 'Base Commander' || base_id ? 1 : 0);
    const overallSummary = await pool.query(overallQuery, overallParams);

    // Get purchases summary
    const purchasesQuery = `
      SELECT 
        COUNT(*) as total_purchases,
        COALESCE(SUM(quantity), 0) as total_purchased_quantity
      FROM purchases p
      JOIN assets a ON p.asset_id = a.id
      WHERE 1=1 ${baseFilter} ${typeFilter} ${dateFilter}
    `;

    const purchasesSummary = await pool.query(purchasesQuery, filterParams);

    // Get transfers summary
    let transfersQuery, transfersParams;
    if (req.user.role === 'Base Commander') {
      transfersQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE from_base_id = $1) as transfers_out,
          COUNT(*) FILTER (WHERE to_base_id = $1) as transfers_in,
          COALESCE(SUM(quantity) FILTER (WHERE from_base_id = $1), 0) as quantity_transferred_out,
          COALESCE(SUM(quantity) FILTER (WHERE to_base_id = $1), 0) as quantity_transferred_in
        FROM transfers t
        JOIN assets a ON t.asset_id = a.id
        WHERE (from_base_id = $1 OR to_base_id = $1) AND status = 'Completed' ${typeFilter} ${dateFilter}
      `;
      transfersParams = [req.user.base_id, ...filterParams.slice(1)];
    } else {
      transfersQuery = `
        SELECT 
          COUNT(*) as total_transfers,
          COALESCE(SUM(quantity), 0) as total_transferred_quantity
        FROM transfers t
        JOIN assets a ON t.asset_id = a.id
        WHERE status = 'Completed' ${typeFilter} ${dateFilter}
      `;
      transfersParams = filterParams.slice(req.user.role === 'Base Commander' || base_id ? 1 : 0);
    }

    const transfersSummary = await pool.query(transfersQuery, transfersParams);

    // Get assignments summary
    const assignmentsQuery = `
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(*) FILTER (WHERE status = 'Active') as active_assignments,
        COUNT(*) FILTER (WHERE status = 'Returned') as returned_assignments,
        COALESCE(SUM(quantity) FILTER (WHERE status = 'Active'), 0) as active_assigned_quantity
      FROM assignments ass
      JOIN assets a ON ass.asset_id = a.id
      WHERE 1=1 ${baseFilter} ${typeFilter} ${dateFilter}
    `;

    const assignmentsSummary = await pool.query(assignmentsQuery, filterParams);

    // Get expenditures summary
    const expendituresQuery = `
      SELECT 
        COUNT(*) as total_expenditures,
        COALESCE(SUM(quantity), 0) as total_expended_quantity
      FROM expenditures e
      JOIN assets a ON e.asset_id = a.id
      WHERE 1=1 ${baseFilter} ${typeFilter} ${dateFilter}
    `;

    const expendituresSummary = await pool.query(expendituresQuery, filterParams);

    // Calculate net movement
    const purchases = parseInt(purchasesSummary.rows[0]?.total_purchased_quantity || 0);
    const transfersIn = req.user.role === 'Base Commander' 
      ? parseInt(transfersSummary.rows[0]?.quantity_transferred_in || 0)
      : 0;
    const transfersOut = req.user.role === 'Base Commander' 
      ? parseInt(transfersSummary.rows[0]?.quantity_transferred_out || 0)
      : 0;
    const expenditures = parseInt(expendituresSummary.rows[0]?.total_expended_quantity || 0);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = parseInt(overallSummary.rows[0]?.total_quantity || 0);
    const openingBalance = closingBalance - netMovement + expenditures;

    // Get recent activities (last 10 transactions)
    const recentActivitiesQuery = `
      (SELECT 'Purchase' as type, p.date, p.quantity, a.name as asset_name, a.type as asset_type, b.name as base_name, u.name as user_name, p.created_at
       FROM purchases p
       JOIN assets a ON p.asset_id = a.id
       JOIN bases b ON p.base_id = b.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE 1=1 ${baseFilter})
      UNION ALL
      (SELECT 'Transfer' as type, t.date, t.quantity, a.name as asset_name, a.type as asset_type, 
              CASE WHEN t.from_base_id = COALESCE($${req.user.role === 'Base Commander' ? 1 : 'NULL'}, t.from_base_id) 
                   THEN 'OUT to ' || tb.name 
                   ELSE 'IN from ' || fb.name END as base_name,
              u.name as user_name, t.created_at
       FROM transfers t
       JOIN assets a ON t.asset_id = a.id
       JOIN bases fb ON t.from_base_id = fb.id
       JOIN bases tb ON t.to_base_id = tb.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.status = 'Completed' ${req.user.role === 'Base Commander' ? 'AND (t.from_base_id = $1 OR t.to_base_id = $1)' : ''})
      UNION ALL
      (SELECT 'Assignment' as type, ass.date, ass.quantity, a.name as asset_name, a.type as asset_type, 
              'Assigned to ' || ass.assigned_to as base_name, u.name as user_name, ass.created_at
       FROM assignments ass
       JOIN assets a ON ass.asset_id = a.id
       LEFT JOIN users u ON ass.user_id = u.id
       WHERE 1=1 ${baseFilter})
      UNION ALL
      (SELECT 'Expenditure' as type, e.date, e.quantity, a.name as asset_name, a.type as asset_type, 
              COALESCE(e.reason, 'Expended') as base_name, u.name as user_name, e.created_at
       FROM expenditures e
       JOIN assets a ON e.asset_id = a.id
       LEFT JOIN users u ON e.user_id = u.id
       WHERE 1=1 ${baseFilter})
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentActivitiesParams = req.user.role === 'Base Commander' ? [req.user.base_id] : [];
    const recentActivities = await pool.query(recentActivitiesQuery, recentActivitiesParams);

    res.json({
      success: true,
      data: {
        summary: {
          opening_balance: openingBalance,
          closing_balance: closingBalance,
          net_movement: netMovement,
          assigned_assets: parseInt(assignmentsSummary.rows[0]?.active_assigned_quantity || 0),
          expended_assets: expenditures,
          movement_breakdown: {
            purchases: purchases,
            transfers_in: transfersIn,
            transfers_out: transfersOut
          }
        },
        assets: {
          total_assets: parseInt(overallSummary.rows[0]?.total_assets || 0),
          total_quantity: closingBalance,
          assets_with_stock: parseInt(overallSummary.rows[0]?.assets_with_stock || 0),
          assets_out_of_stock: parseInt(overallSummary.rows[0]?.assets_out_of_stock || 0),
          by_type: assetSummary.rows
        },
        transactions: {
          purchases: {
            count: parseInt(purchasesSummary.rows[0]?.total_purchases || 0),
            quantity: purchases
          },
          transfers: req.user.role === 'Base Commander' ? {
            transfers_in: parseInt(transfersSummary.rows[0]?.transfers_in || 0),
            transfers_out: parseInt(transfersSummary.rows[0]?.transfers_out || 0),
            quantity_in: transfersIn,
            quantity_out: transfersOut
          } : {
            count: parseInt(transfersSummary.rows[0]?.total_transfers || 0),
            quantity: parseInt(transfersSummary.rows[0]?.total_transferred_quantity || 0)
          },
          assignments: {
            total: parseInt(assignmentsSummary.rows[0]?.total_assignments || 0),
            active: parseInt(assignmentsSummary.rows[0]?.active_assignments || 0),
            returned: parseInt(assignmentsSummary.rows[0]?.returned_assignments || 0),
            active_quantity: parseInt(assignmentsSummary.rows[0]?.active_assigned_quantity || 0)
          },
          expenditures: {
            count: parseInt(expendituresSummary.rows[0]?.total_expenditures || 0),
            quantity: expenditures
          }
        },
        recent_activities: recentActivities.rows,
        filters: {
          base_id: base_id || null,
          start_date: start_date || null,
          end_date: end_date || null,
          type: type || null
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available bases (for filter dropdown)
const getBases = async (req, res) => {
  try {
    let query = 'SELECT id, name, location FROM bases ORDER BY name';
    let queryParams = [];

    // Base Commanders can only see their own base
    if (req.user.role === 'Base Commander') {
      query = 'SELECT id, name, location FROM bases WHERE id = $1 ORDER BY name';
      queryParams = [req.user.base_id];
    }

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        bases: result.rows
      }
    });
  } catch (error) {
    console.error('Get bases error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get asset types (for filter dropdown)
const getAssetTypes = async (req, res) => {
  try {
    let query = `
      SELECT DISTINCT type 
      FROM assets 
      WHERE 1=1
    `;
    let queryParams = [];

    if (req.user.role === 'Base Commander') {
      query += ' AND base_id = $1';
      queryParams = [req.user.base_id];
    }

    query += ' ORDER BY type';

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        types: result.rows.map(row => row.type)
      }
    });
  } catch (error) {
    console.error('Get asset types error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getBases,
  getAssetTypes
};