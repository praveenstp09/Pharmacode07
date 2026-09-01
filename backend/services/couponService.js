import Coupon from '../models/Coupon.js';
import AppError from '../utils/AppError.js';

export const validateCouponCode = async (code, orderAmount) => {
  if (!code) {
    throw new AppError('Please enter a coupon code', 400);
  }

  const cleanCode = String(code).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
  if (!coupon) {
    throw new AppError('Invalid or inactive coupon code', 404);
  }

  if (new Date() > new Date(coupon.expiryDate)) {
    throw new AppError('This coupon has expired', 400);
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit has been reached', 400);
  }

  const numericAmount = Math.max(0, Number(orderAmount) || 0);

  if (numericAmount < coupon.minOrderValue) {
    throw new AppError(`Minimum order value for this coupon is ₹${coupon.minOrderValue}`, 400);
  }

  let discount = (numericAmount * coupon.discountPercent) / 100;
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }
  discount = Math.round(discount);

  const finalAmount = Math.max(0, numericAmount - discount);

  return {
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    discountAmount: discount,
    finalAmount,
  };
};
