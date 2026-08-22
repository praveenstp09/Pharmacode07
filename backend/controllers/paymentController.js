import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Purchase from '../models/Purchase.js';
import TestSeries from '../models/TestSeries.js';
import StudyMaterial from '../models/StudyMaterial.js';
import SingleModelPaper from '../models/SingleModelPaper.js';
import NonPharmaResource from '../models/NonPharmaResource.js';
import razorpayInstance from '../config/razorpay.js';

// Helper to auto-enroll user in purchased items with 365 days validity
const enrollUserInItems = async (userId, items, orderId = null) => {
  const user = await User.findById(userId);
  if (!user) return;

  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  for (const item of items) {
    const itemIdStr = (item.itemId || item._id || item.id).toString();

    if (item.itemType === 'TestSeries') {
      user.purchasedTests = user.purchasedTests || [];
      if (!user.purchasedTests.some(id => id.toString() === itemIdStr)) {
        user.purchasedTests.push(item.itemId);
      }
    } else if (item.itemType === 'StudyMaterial') {
      user.purchasedMaterials = user.purchasedMaterials || [];
      if (!user.purchasedMaterials.some(id => id.toString() === itemIdStr)) {
        user.purchasedMaterials.push(item.itemId);
      }
    } else if (item.itemType === 'SingleModelPaper') {
      user.purchasedSingleModels = user.purchasedSingleModels || [];
      if (!user.purchasedSingleModels.some(id => id.toString() === itemIdStr)) {
        user.purchasedSingleModels.push(item.itemId);
      }
    } else if (item.itemType === 'NonPharmaResource') {
      user.purchasedNonPharma = user.purchasedNonPharma || [];
      if (!user.purchasedNonPharma.some(id => id.toString() === itemIdStr)) {
        user.purchasedNonPharma.push(item.itemId);
      }
    }

    // Upsert Purchase record with 365 days validity
    await Purchase.findOneAndUpdate(
      { userId, itemType: item.itemType, itemId: item.itemId },
      {
        userId,
        itemType: item.itemType,
        itemId: item.itemId,
        orderId,
        purchasedAt: new Date(),
        expiresAt: oneYearFromNow,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }

  await user.save();
};

// @desc    Create checkout order (Razorpay or Simulated)
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in checkout order' });
    }

    // Check for duplicate active purchases
    for (const item of items) {
      const id = item.id || item._id || item.itemId;
      const type = item.type || item.itemType || 'TestSeries';

      const existingActivePurchase = await Purchase.findOne({
        userId: req.user.id,
        itemType: type,
        itemId: id,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (existingActivePurchase) {
        return res.status(400).json({
          success: false,
          message: `You already have an active enrollment for "${item.title || 'one of the items'}". Please check your dashboard.`,
        });
      }
    }

    // Server-side price calculation & verification
    let verifiedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const id = item.id || item._id || item.itemId;
      const type = item.type || item.itemType || 'TestSeries';

      let actualPrice = 0;
      let actualTitle = item.title || 'Product';

      if (type === 'TestSeries') {
        const doc = await TestSeries.findById(id);
        if (!doc) {
          return res.status(404).json({ success: false, message: `Test Series not found: ${id}` });
        }
        actualPrice = doc.isFree ? 0 : (doc.discountPrice !== undefined ? doc.discountPrice : doc.price);
        actualTitle = doc.title;
      } else if (type === 'StudyMaterial') {
        const doc = await StudyMaterial.findById(id);
        if (!doc) {
          return res.status(404).json({ success: false, message: `Study Material not found: ${id}` });
        }
        actualPrice = doc.isPaid ? (doc.price || 0) : 0;
        actualTitle = doc.title;
      } else if (type === 'SingleModelPaper') {
        const doc = await SingleModelPaper.findById(id);
        if (!doc) {
          return res.status(404).json({ success: false, message: `Model Paper not found: ${id}` });
        }
        actualPrice = doc.isFree ? 0 : (doc.discountPrice !== undefined ? doc.discountPrice : doc.price);
        actualTitle = doc.title;
      } else if (type === 'NonPharmaResource') {
        const doc = await NonPharmaResource.findById(id);
        if (!doc) {
          return res.status(404).json({ success: false, message: `Non-Pharma Resource not found: ${id}` });
        }
        actualPrice = doc.isPaid ? (doc.price || 0) : 0;
        actualTitle = doc.title;
      }

      verifiedSubtotal += actualPrice;
      verifiedItems.push({
        itemId: id,
        itemType: type,
        title: actualTitle,
        price: actualPrice,
      });
    }

    // Server-side coupon verification
    let verifiedDiscount = 0;
    let verifiedCoupon = '';

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (coupon) {
        const isNotExpired = !coupon.expiryDate || new Date(coupon.expiryDate) > new Date();
        const meetsMinOrder = !coupon.minOrderValue || verifiedSubtotal >= coupon.minOrderValue;
        const withinUsage = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;

        if (isNotExpired && meetsMinOrder && withinUsage) {
          verifiedCoupon = coupon.code;
          verifiedDiscount = Math.round((verifiedSubtotal * coupon.discountPercent) / 100);
          if (coupon.maxDiscount && verifiedDiscount > coupon.maxDiscount) {
            verifiedDiscount = coupon.maxDiscount;
          }
        }
      }
    }

    const verifiedTotal = Math.max(0, verifiedSubtotal - verifiedDiscount);
    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let razorpayOrder = null;
    let paymentMethod = verifiedTotal === 0 ? 'free' : 'simulated';

    // If Razorpay instance is configured and total > 0
    if (razorpayInstance && verifiedTotal > 0) {
      try {
        const options = {
          amount: Math.round(verifiedTotal * 100), // amount in paise
          currency: 'INR',
          receipt: orderId,
        };
        razorpayOrder = await razorpayInstance.orders.create(options);
        paymentMethod = 'razorpay';
      } catch (err) {
        console.warn('Razorpay order creation failed, falling back to simulated:', err.message);
        paymentMethod = 'simulated';
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      orderId: razorpayOrder ? razorpayOrder.id : orderId,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      discountAmount: verifiedDiscount,
      couponApplied: verifiedCoupon,
      totalAmount: verifiedTotal,
      paymentStatus: 'pending',
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      order,
      razorpayOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
      isSimulated: paymentMethod === 'simulated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ orderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Idempotent: If already completed, return success immediately
    if (order.paymentStatus === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already verified and packages are active',
        orderId: order.orderId,
      });
    }

    // User ownership verification
    if (order.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: 'Razorpay key secret is not configured' });
    }

    // Verify HMAC-SHA256 signature using timing-safe comparison
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature || '');

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isMatch) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    if (order.paymentStatus === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already verified and items unlocked',
        orderId: order.orderId,
      });
    }

    order.paymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'completed';
    await order.save();

    // Auto-enroll user in purchased items
    await enrollUserInItems(order.userId, order.items, order._id);

    // Update coupon usage count if used
    if (order.couponApplied) {
      await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: 1 } });
    }

    res.json({
      success: true,
      message: 'Payment verified and items unlocked successfully',
      orderId: order.orderId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process 100% Free / Discounted Checkout
// @route   POST /api/payments/free-checkout
// @access  Private
export const freeCheckout = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'completed') {
      return res.json({
        success: true,
        message: 'Order is already completed',
        orderId: order.orderId,
      });
    }

    if (order.totalAmount > 0) {
      return res.status(400).json({ success: false, message: 'This order requires online payment via Razorpay' });
    }

    order.paymentId = `FREE_ENROLL_${Date.now()}`;
    order.paymentStatus = 'completed';
    order.paymentMethod = 'free';
    await order.save();

    // Auto-enroll user in purchased items
    await enrollUserInItems(order.userId, order.items, order._id);

    if (order.couponApplied) {
      await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: 1 } });
    }

    res.json({
      success: true,
      message: 'Free enrollment successful! Packages unlocked in your account.',
      orderId: order.orderId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay Webhook Handler for automated asynchronous order completion
// @route   POST /api/payments/webhook
// @access  Public (Signature Verified)
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret || !signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook signature or secret' });
    }

    const payloadBuffer = req.rawBody || (typeof req.body === 'string' ? Buffer.from(req.body) : Buffer.from(JSON.stringify(req.body)));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadBuffer)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);

    const isMatch =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ orderId: razorpayOrderId });
        if (order && order.paymentStatus !== 'completed') {
          order.paymentId = paymentEntity?.id || `WH_${Date.now()}`;
          order.paymentStatus = 'completed';
          await order.save();

          await enrollUserInItems(order.userId, order.items, order._id);

          if (order.couponApplied) {
            await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: 1 } });
          }
        }
      }
    }

    res.json({ success: true, status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
