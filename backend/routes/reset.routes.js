import express from 'express';
import { resetData } from '../controllers/reset.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, resetData);

export default router;