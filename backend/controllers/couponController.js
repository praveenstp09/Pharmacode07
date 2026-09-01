import * as couponService from '../services/couponService.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const data = await couponService.validateCouponCode(req.body.code, req.body.orderAmount);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
