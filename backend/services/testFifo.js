import pool from '../db/pool.js';
import { addPurchase, processSale } from './fifo.service.js';

async function runTest() {
  try {
    // 1. Create the product first (foreign key requirement)
    await pool.query(
      `INSERT INTO products (product_id, name)
       VALUES ($1, $2)
       ON CONFLICT (product_id) DO NOTHING`,
      ['PRD001', 'Test Product']
    );

    // 2. Add two purchase batches at different prices/times
    const batch1 = await addPurchase({
      product_id: 'PRD001',
      quantity: 30,
      unit_price: 100.0,
      timestamp: '2025-07-10T10:00:00Z',
    });
    console.log('Batch 1 created:', batch1);

    const batch2 = await addPurchase({
      product_id: 'PRD001',
      quantity: 40,
      unit_price: 120.0,
      timestamp: '2025-07-12T10:00:00Z',
    });
    console.log('Batch 2 created:', batch2);

    // 3. Sell 50 units -> should consume all of batch1 (30 @100) + 20 from batch2 (@120)
    // Expected cost = 30*100 + 20*120 = 3000 + 2400 = 5400
    const sale = await processSale({
      product_id: 'PRD001',
      quantity: 50,
      timestamp: '2025-07-15T10:00:00Z',
    });
    console.log('Sale recorded:', sale);
    console.log('Expected total_cost: 5400.00, Got:', sale.total_cost);

  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await pool.end();
  }
}

runTest();