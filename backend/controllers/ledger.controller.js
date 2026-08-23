import pool from '../db/pool.js';

// GET /ledger — Combined time-series of purchases and sales
export async function getLedger(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        'purchase' AS type,
        product_id,
        quantity,
        unit_price AS price,
        NULL AS cost,
        purchase_timestamp AS timestamp
      FROM inventory_batches

      UNION ALL

      SELECT
        'sale' AS type,
        product_id,
        quantity,
        NULL AS price,
        total_cost AS cost,
        sale_timestamp AS timestamp
      FROM sales

      ORDER BY timestamp ASC
    `);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching ledger:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch ledger' });
  }
}