import express from 'express';
import {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authStrictLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validate.js';

const router = express.Router();

router.post('/register', authStrictLimiter, validateRegister, register);
router.post('/login', authStrictLimiter, validateLogin, login);
router.post('/refresh-token', authStrictLimiter, validateRefreshToken, refreshToken);
router.post('/verify-email-otp', authStrictLimiter, verifyEmail);
router.post('/resend-otp', authStrictLimiter, resendOTP);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, validateUpdateProfile, updateProfile);
router.post('/forgot-password', authStrictLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', authStrictLimiter, validateResetPassword, resetPassword);

export default router;
