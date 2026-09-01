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
import AppError from '../utils/AppError.js';

export const enrollUserInItems = async (userId, items, orderId = null) => {
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

export const initiateCheckoutOrder = async (currentUser, { items, couponCode }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('No items in checkout order', 400);
  }

  // Check for duplicate active purchases
  for (const item of items) {
    const itemId = item.itemId || item.id || item._id;
    const itemType = item.itemType || item.type || 'TestSeries';

    const existingPurchase = await Purchase.findOne({
      userId: currentUser._id,
      itemType,
      itemId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
    if (existingPurchase) {
      throw new AppError(`You already own active access to "${item.title || 'this item'}". You cannot purchase it twice.`, 400);
    }
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const itemId = item.itemId || item.id || item._id;
    const itemType = item.itemType || item.type || 'TestSeries';

    let dbItem = null;
    if (itemType === 'TestSeries') {
      dbItem = await TestSeries.findById(itemId);
    } else if (itemType === 'StudyMaterial') {
      dbItem = await StudyMaterial.findById(itemId);
    } else if (itemType === 'SingleModelPaper') {
      dbItem = await SingleModelPaper.findById(itemId);
    } else if (itemType === 'NonPharmaResource') {
      dbItem = await NonPharmaResource.findById(itemId);
    }

    if (!dbItem) {
      throw new AppError(`Item not found in catalog: ${item.title || itemId}`, 404);
    }

    let itemPrice = 0;
    if (itemType === 'TestSeries') {
      itemPrice = dbItem.isFree ? 0 : (dbItem.discountPrice !== undefined ? dbItem.discountPrice : dbItem.price);
    } else if (itemType === 'StudyMaterial') {
      itemPrice = dbItem.isPaid ? (dbItem.discountPrice !== undefined && dbItem.discountPrice !== null ? dbItem.discountPrice : dbItem.price) : 0;
    } else if (itemType === 'SingleModelPaper') {
      itemPrice = dbItem.isFree ? 0 : (dbItem.discountPrice !== undefined && dbItem.discountPrice !== null ? dbItem.discountPrice : dbItem.price);
    } else if (itemType === 'NonPharmaResource') {
      itemPrice = dbItem.isFree ? 0 : (dbItem.price || 0);
    }

    subtotal += itemPrice;
    validatedItems.push({
      itemId: dbItem._id,
      itemType,
      title: dbItem.title,
      price: itemPrice,
    });
  }

  // Coupon calculation
  let discountAmount = 0;
  let appliedCouponCode = '';

  if (couponCode) {
    const cleanCode = String(couponCode).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (coupon && new Date() <= new Date(coupon.expiryDate) && coupon.usedCount < coupon.usageLimit) {
      if (subtotal >= coupon.minOrderValue) {
        let discount = (subtotal * coupon.discountPercent) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        discountAmount = Math.round(discount);
        appliedCouponCode = coupon.code;
      }
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  let paymentMethod = 'razorpay';
  let razorpayOrder = null;

  if (totalAmount === 0) {
    paymentMethod = 'free';
  } else if (razorpayInstance) {
    try {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: currentUser.id,
          userName: currentUser.name,
          itemsCount: validatedItems.length,
        },
      });
    } catch (rzpErr) {
      console.warn('Razorpay API error, falling back to simulated order:', rzpErr.message);
      paymentMethod = 'simulated';
    }
  } else {
    paymentMethod = 'simulated';
  }

  const uniqueOrderId = razorpayOrder ? razorpayOrder.id : `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const order = await Order.create({
    userId: currentUser.id,
    orderId: uniqueOrderId,
    items: validatedItems,
    subtotal,
    discountAmount,
    couponApplied: appliedCouponCode,
    totalAmount,
    paymentStatus: 'pending',
    paymentMethod,
  });

  return {
    order,
    razorpayOrder,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    isSimulated: paymentMethod === 'simulated',
  };
};

export const verifyPaymentSignature = async (currentUser, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const order = await Order.findOne({ orderId: razorpay_order_id });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'completed') {
    return {
      message: 'Payment already verified and packages are active',
      orderId: order.orderId,
    };
  }

  if (order.userId.toString() !== currentUser.id.toString()) {
    throw new AppError('Unauthorized access to this order', 403);
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new AppError('Razorpay key secret is not configured', 500);
  }

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
    throw new AppError('Payment verification failed: Invalid signature', 400);
  }

  order.paymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.paymentStatus = 'completed';
  await order.save();

  await enrollUserInItems(order.userId, order.items, order._id);

  if (order.couponApplied) {
    await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: 1 } });
  }

  return {
    message: 'Payment verified and items unlocked successfully',
    orderId: order.orderId,
  };
};

export const processFreeEnrollment = async (currentUser, { orderId }) => {
  const order = await Order.findOne({ orderId, userId: currentUser.id });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'completed') {
    return {
      message: 'Order is already completed',
      orderId: order.orderId,
    };
  }

  if (order.totalAmount > 0) {
    throw new AppError('This order requires online payment via Razorpay', 400);
  }

  order.paymentId = `FREE_ENROLL_${Date.now()}`;
  order.paymentStatus = 'completed';
  order.paymentMethod = 'free';
  await order.save();

  await enrollUserInItems(order.userId, order.items, order._id);

  if (order.couponApplied) {
    await Coupon.findOneAndUpdate({ code: order.couponApplied }, { $inc: { usedCount: 1 } });
  }

  return {
    message: 'Free enrollment successful! Packages unlocked in your account.',
    orderId: order.orderId,
  };
};

export const processWebhookEvent = async (req) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret || !signature) {
    throw new AppError('Missing webhook signature or secret', 400);
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
    throw new AppError('Invalid webhook signature', 400);
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

  return { status: 'ok' };
};
