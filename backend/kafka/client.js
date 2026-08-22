import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

const kafkaClient = new Kafka({
  clientId: 'inventory-management-system',
  brokers: [process.env.KAFKA_BROKER],
  ssl: true,
  sasl: {
    mechanism: 'scram-sha-256',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});

export default kafkaClient;