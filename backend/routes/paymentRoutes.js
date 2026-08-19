import express from 'express';
import {
  createOrder,
  verifyRazorpayPayment,
  simulatePayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All payment actions require student to be logged in

router.post('/create-order', createOrder);
router.post('/verify', verifyRazorpayPayment);
router.post('/simulate', simulatePayment);

export default router;
