import express from 'express';
import { getLedger } from '../controllers/ledger.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', verifyToken, getLedger);

export default router;