import kafka from '../kafka/client.js';
import pool from '../db/pool.js';

const producer = kafka.producer();
let isConnected = false;

async function ensureConnected() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }
}

// pushes one purchase/sale event to Kafka.
// Biases toward "purchase" if the chosen product has little/no remaining stock,
// so demo simulations don't fail with "insufficient stock" right after a reset.
export async function simulateTransaction(req, res) {
  try {
    await ensureConnected();

    const products = ['PRD001', 'PRD002', 'PRD003'];
    const product_id = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 50) + 1; // 1 to 50

    // Check current available stock for this product
    const stockResult = await pool.query(
      `SELECT COALESCE(SUM(remaining_quantity), 0) AS available
       FROM inventory_batches
       WHERE product_id = $1`,
      [product_id]
    );
    const availableStock = parseInt(stockResult.rows[0].available, 10);

    // If there isn't enough stock to cover a random sale, force a purchase instead
    let event_type;
    if (availableStock < quantity) {
      event_type = 'purchase';
    } else {
      event_type = Math.random() < 0.5 ? 'purchase' : 'sale';
    }

    const event = {
      product_id,
      event_type,
      quantity,
      timestamp: new Date().toISOString(),
    };

    if (event_type === 'purchase') {
      event.unit_price = Math.floor(Math.random() * 100) + 50; // 50 to 150
    }

    await producer.send({
      topic: 'inventory-events',
      messages: [{ value: JSON.stringify(event) }],
    });

    res.json({ success: true, message: 'Event sent', event });
  } catch (err) {
    console.error('Simulate error:', err);
    res.status(500).json({ success: false, message: 'Failed to simulate transaction' });
  }
}