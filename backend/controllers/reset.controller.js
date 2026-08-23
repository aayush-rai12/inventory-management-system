import pool from '../db/pool.js';

export async function resetData(req, res) {
  try {
    await pool.query(`
      TRUNCATE TABLE sales, inventory_batches, products
      RESTART IDENTITY CASCADE
    `);
    res.json({ success: true, message: 'Data reset successfully' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset data' });
  }
}