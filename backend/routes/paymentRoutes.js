import express from 'express';
import {
  createOrder,
  verifyRazorpayPayment,
  freeCheckout,
  handleRazorpayWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public webhook route (signature verified internally)
router.post('/webhook', handleRazorpayWebhook);

// Protected routes
router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyRazorpayPayment);
router.post('/free-checkout', freeCheckout);

export default router;
