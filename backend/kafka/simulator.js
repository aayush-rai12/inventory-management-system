import kafka from './client.js';

const producer = kafka.producer();

// Dummy events to simulate — mix of purchases and sales
const dummyEvents = [
  {
    product_id: 'PRD001',
    event_type: 'purchase',
    quantity: 50,
    unit_price: 100.0,
    timestamp: '2025-07-10T10:00:00Z',
  },
  {
    product_id: 'PRD001',
    event_type: 'purchase',
    quantity: 30,
    unit_price: 120.0,
    timestamp: '2025-07-12T10:00:00Z',
  },
  {
    product_id: 'PRD001',
    event_type: 'sale',
    quantity: 40,
    timestamp: '2025-07-15T10:00:00Z',
  },
  {
    product_id: 'PRD002',
    event_type: 'purchase',
    quantity: 100,
    unit_price: 50.0,
    timestamp: '2025-07-11T10:00:00Z',
  },
  {
    product_id: 'PRD002',
    event_type: 'sale',
    quantity: 25,
    timestamp: '2025-07-16T10:00:00Z',
  },
];

async function runSimulator() {
  await producer.connect();
  console.log('Producer connected');

  for (const event of dummyEvents) {
    await producer.send({
      topic: 'inventory-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    console.log('Sent event:', event);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await producer.disconnect();
  console.log('Producer disconnected. All events sent');
}

runSimulator().catch((err) => {
  console.error('Simulator error:', err);
});