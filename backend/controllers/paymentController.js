import * as paymentService from '../services/paymentService.js';

export const createOrder = async (req, res, next) => {
  try {
    const data = await paymentService.initiateCheckoutOrder(req.user, req.body);
    res.status(201).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const data = await paymentService.verifyPaymentSignature(req.user, req.body);
    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const freeCheckout = async (req, res, next) => {
  try {
    const data = await paymentService.processFreeEnrollment(req.user, req.body);
    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const data = await paymentService.processWebhookEvent(req);
    res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};
