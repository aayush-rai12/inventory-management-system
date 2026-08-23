import pool from '../db/pool.js';

// GET /products — Stock overview: product_id, current qty, total cost, avg cost/unit
export async function getStockOverview(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        product_id,
        SUM(remaining_quantity) AS current_quantity,
        SUM(remaining_quantity * unit_price) AS total_inventory_cost,
        CASE
          WHEN SUM(remaining_quantity) > 0
          THEN ROUND(SUM(remaining_quantity * unit_price) / SUM(remaining_quantity), 2)
          ELSE 0
        END AS average_cost_per_unit
      FROM inventory_batches
      WHERE remaining_quantity > 0
      GROUP BY product_id
      ORDER BY product_id
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching stock overview:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stock overview' });
  }
}