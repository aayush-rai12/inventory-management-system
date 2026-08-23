import express from 'express';
import { getStockOverview } from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getStockOverview);

export default router;