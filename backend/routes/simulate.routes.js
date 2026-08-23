import express from 'express';
import { simulateTransaction } from '../controllers/simulate.controller.js';

const router = express.Router();

router.post('/', simulateTransaction);

export default router;