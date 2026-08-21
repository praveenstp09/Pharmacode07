import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Purchase from '../models/Purchase.js';
import razorpayInstance from '../config/razorpay.js';

// Helper to auto-enroll user in purchased items with 365 days validity
const enrollUserInItems = async (userId, items, orderId = null) => {
  const user = await User.findById(userId);
  if (!user) return;

  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  for (const item of items) {
    if (item.itemType === 'TestSeries') {
      if (!user.purchasedTests.some(id => id.toString() === item.itemId.toString())) {
        user.purchasedTests.push(item.itemId);
      }
    } else if (item.itemType === 'StudyMaterial') {
      if (!user.purchasedMaterials.some(id => id.toString() === item.itemId.toString())) {
        user.purchasedMaterials.push(item.itemId);
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
    const { items, couponCode, subtotal, discountAmount, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in checkout order' });
    }

    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let razorpayOrder = null;
    let paymentMethod = 'simulated';

    // If Razorpay instance is configured and total > 0
    if (razorpayInstance && totalAmount > 0) {
      try {
        const options = {
          amount: Math.round(totalAmount * 100), // amount in paise
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
      items: items.map(item => ({
        itemId: item.id || item._id,
        itemType: item.type || 'TestSeries',
        title: item.title,
        price: item.price,
      })),
      subtotal,
      discountAmount: discountAmount || 0,
      couponApplied: couponCode || '',
      totalAmount,
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

    // Verify HMAC-SHA256 signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    order.paymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'completed';
    await order.save();

    // Auto-enroll user in purchased items
    await enrollUserInItems(order.userId, order.items);

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

// @desc    Simulate instant payment (Sandbox / Testing)
// @route   POST /api/payments/simulate
// @access  Private
export const simulatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentId = `SIM_PAY_${Date.now()}`;
    order.paymentStatus = 'completed';
    order.paymentMethod = 'simulated';
    await order.save();

    // Auto-enroll user in purchased items
    await enrollUserInItems(order.userId, order.items);

    // Update coupon usage count
    if (order.couponApplied) {
      await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: 1 } });
    }

    res.json({
      success: true,
      message: 'Simulated payment successful! Test series unlocked in your account.',
      orderId: order.orderId,
      itemsUnlocked: order.items.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
