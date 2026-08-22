import pool from '../db/pool.js';

// Handles a "purchase" event: creates a new inventory batch
export async function addPurchase({ product_id, quantity, unit_price, timestamp }) {
  // Ensure the product exists before creating a batch (auto-register new products)
  await pool.query(
    `INSERT INTO products (product_id)
     VALUES ($1)
     ON CONFLICT (product_id) DO NOTHING`,
    [product_id]
  );

  const result = await pool.query(
    `INSERT INTO inventory_batches
      (product_id, quantity, remaining_quantity, unit_price, purchase_timestamp)
     VALUES ($1, $2, $2, $3, $4)
     RETURNING *`,
    [product_id, quantity, unit_price, timestamp]
  );
  return result.rows[0];
}

// Handles a "sale" event: consumes oldest batches first (FIFO), computes cost
export async function processSale({ product_id, quantity, timestamp }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch batches with remaining stock, oldest first (FIFO order)
    const { rows: batches } = await client.query(
      `SELECT * FROM inventory_batches
       WHERE product_id = $1 AND remaining_quantity > 0
       ORDER BY purchase_timestamp ASC
       FOR UPDATE`,
      [product_id]
    );

    let remainingToSell = quantity;
    let totalCost = 0;

    // 2. Walk through batches oldest -> newest, consuming stock
    for (const batch of batches) {
      if (remainingToSell <= 0) break;

      const consumeQty = Math.min(batch.remaining_quantity, remainingToSell);
      totalCost += consumeQty * parseFloat(batch.unit_price);

      await client.query(
        `UPDATE inventory_batches
         SET remaining_quantity = remaining_quantity - $1
         WHERE id = $2`,
        [consumeQty, batch.id]
      );

      remainingToSell -= consumeQty;
    }

    // 3. If we couldn't fulfill the full sale, not enough stock
    if (remainingToSell > 0) {
      throw new Error(
        `Insufficient stock for ${product_id}: short by ${remainingToSell} units`
      );
    }

    // 4. Record the sale with the FIFO-computed cost
    const { rows } = await client.query(
      `INSERT INTO sales (product_id, quantity, total_cost, sale_timestamp)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_id, quantity, totalCost.toFixed(2), timestamp]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
      await client.query('ROLLBACK');
      throw err;
  } finally {
      client.release();
  }
}