import express from 'express';
import {
  createOrder,
  verifyRazorpayPayment,
  freeCheckout,
  handleRazorpayWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import {
  validateCreateOrder,
  validateVerifyPayment,
  validateFreeCheckout,
} from '../middleware/validate.js';

const router = express.Router();

// Public webhook route (signature verified internally)
router.post('/webhook', handleRazorpayWebhook);

// Protected routes
router.use(protect);
router.post('/create-order', validateCreateOrder, createOrder);
router.post('/verify', validateVerifyPayment, verifyRazorpayPayment);
router.post('/free-checkout', validateFreeCheckout, freeCheckout);

export default router;
