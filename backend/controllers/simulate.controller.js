import kafka from '../kafka/client.js';

const producer = kafka.producer();
let isConnected = false;

async function ensureConnected() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }
}

//send event from frontend to kafka 
export async function simulateTransaction(req, res) {
  try {
    await ensureConnected();

    const products = ['PRD001', 'PRD002', 'PRD003'];
    const eventTypes = ['purchase', 'sale'];

    const product_id = products[Math.floor(Math.random() * products.length)];
    const event_type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const quantity = Math.floor(Math.random() * 50) + 1; // 1 to 50

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