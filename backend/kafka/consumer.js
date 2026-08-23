import kafka from './client.js';
import { addPurchase, processSale } from '../services/fifo.service.js';

const consumer = kafka.consumer({ groupId: 'inventory-consumer-group' });

export async function startConsumer() {
  await consumer.connect();
  console.log('Consumer connected');

  await consumer.subscribe({ topic: 'inventory-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log('Received event:', event);

      try {
        if (event.event_type === 'purchase') {
          const batch = await addPurchase(event);
          console.log('Purchase processed, batch created:', batch.id);
        } else if (event.event_type === 'sale') {
          const sale = await processSale(event);
          console.log('Sale processed, cost calculated:', sale.total_cost);
        } else {
          console.warn('Unknown event_type:', event.event_type);
        }
      } catch (err) {
        console.error('Error processing event:', err.message);
      }
    },
  });
}
// Only runs when this file is executed directly (local dev)
if (import.meta.url === `file://${process.argv[1]}`) {
  startConsumer();
}