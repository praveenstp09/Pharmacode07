import crypto from 'crypto';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import AppError from '../utils/AppError.js';
import { sendPasswordResetEmail, sendVerificationOTPEmail } from '../utils/emailNotifier.js';

export const syncUserPurchases = async (user) => {
  const activePurchases = await Purchase.find({
    userId: user._id,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });

  const activeTestIds = activePurchases
    .filter(p => p.itemType === 'TestSeries')
    .map(p => p.itemId.toString());
  const activeMaterialIds = activePurchases
    .filter(p => p.itemType === 'StudyMaterial')
    .map(p => p.itemId.toString());
  const activeSingleModelIds = activePurchases
    .filter(p => p.itemType === 'SingleModelPaper')
    .map(p => p.itemId.toString());
  const activeNonPharmaIds = activePurchases
    .filter(p => p.itemType === 'NonPharmaResource')
    .map(p => p.itemId.toString());

  user.purchasedTests = activeTestIds;
  user.purchasedMaterials = activeMaterialIds;
  user.purchasedSingleModels = activeSingleModelIds;
  user.purchasedNonPharma = activeNonPharmaIds;

  await user.save();
};

export const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  isEmailVerified: !!user.isEmailVerified,
  purchasedTests: (user.purchasedTests || []).map(t => (t?._id || t).toString()),
  purchasedMaterials: (user.purchasedMaterials || []).map(m => (m?._id || m).toString()),
  purchasedSingleModels: (user.purchasedSingleModels || []).map(m => (m?._id || m).toString()),
  purchasedNonPharma: (user.purchasedNonPharma || []).map(m => (m?._id || m).toString()),
});

export const registerUser = async ({ name, email, mobile, password }) => {
  if (!name || !email || !password) {
    throw new AppError('Please provide name, email, and password', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) {
    if (!userExists.isEmailVerified) {
      // Allow unverified user to get a fresh OTP and complete verification
      const otp = userExists.generateEmailVerificationOTP();
      await userExists.save();
      sendVerificationOTPEmail({
        toEmail: userExists.email,
        name: userExists.name,
        otp,
      }).catch(err => console.error('Verification email error:', err.message));

      return {
        requiresVerification: true,
        email: userExists.email,
        message: 'Account already created but pending verification. A fresh 6-digit code has been sent to your email.',
      };
    }
    throw new AppError('Email is already registered. Please login.', 400);
  }

  const user = new User({
    name: name.trim(),
    email: cleanEmail,
    mobile: mobile ? mobile.trim() : '',
    password,
    isEmailVerified: false,
  });

  const otp = user.generateEmailVerificationOTP();
  await user.save();

  // Send 6-digit OTP verification email in background
  sendVerificationOTPEmail({
    toEmail: user.email,
    name: user.name,
    otp,
  }).catch(err => console.error('Verification email error:', err.message));

  return {
    requiresVerification: true,
    email: user.email,
    message: 'A 6-digit verification code has been sent to your email.',
  };
};

export const verifyEmailOTP = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new AppError('Please provide email and verification code', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  const user = await User.findOne({ email: cleanEmail }).select(
    '+emailVerificationOTP +emailVerificationExpires +emailVerificationAttempts'
  );

  if (!user) {
    throw new AppError('User account not found', 404);
  }

  if (user.isEmailVerified) {
    const token = user.getSignedJwtToken();
    const refreshToken = user.generateRefreshToken();
    await user.save();
    return {
      token,
      refreshToken,
      user: formatUser(user),
      message: 'Email is already verified.',
    };
  }

  if (user.emailVerificationAttempts >= 5) {
    throw new AppError('Too many failed verification attempts. Please click "Resend Code" to receive a new OTP.', 429);
  }

  if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
    throw new AppError('Verification code has expired. Please click "Resend Code" to get a new code.', 400);
  }

  const hashedIncomingOtp = crypto.createHash('sha256').update(cleanOtp).digest('hex');

  const expectedBuffer = Buffer.from(user.emailVerificationOTP || '');
  const receivedBuffer = Buffer.from(hashedIncomingOtp);

  const isMatch =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isMatch) {
    user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
    await user.save();
    const remainingAttempts = 5 - user.emailVerificationAttempts;
    throw new AppError(`Invalid verification code. ${remainingAttempts} attempt(s) remaining.`, 400);
  }

  // Verification Successful: Activate Account
  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationAttempts = 0;

  const refreshToken = user.generateRefreshToken();
  await user.save();

  const token = user.getSignedJwtToken();

  return {
    token,
    refreshToken,
    user: formatUser(user),
    message: 'Email verified successfully! Welcome to PharmaCode07.',
  };
};

export const resendVerificationOTP = async ({ email }) => {
  if (!email) {
    throw new AppError('Please provide an email address', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select('+lastOtpSentAt +isEmailVerified');

  if (!user) {
    return {
      success: true,
      message: 'If this account exists, a new verification code has been sent.',
    };
  }

  if (user.isEmailVerified) {
    throw new AppError('This email is already verified. Please login to your account.', 400);
  }

  // 60-second rate limit cooldown between resends
  if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < 60 * 1000) {
    const secondsRemaining = Math.ceil((60 * 1000 - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
    throw new AppError(`Please wait ${secondsRemaining} second(s) before requesting another code.`, 429);
  }

  const otp = user.generateEmailVerificationOTP();
  await user.save();

  sendVerificationOTPEmail({
    toEmail: user.email,
    name: user.name,
    otp,
  }).catch(err => console.error('Verification email error:', err.message));

  return {
    success: true,
    message: 'A new 6-digit verification code has been sent to your email.',
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail }).select('+password +failedLoginAttempts +lockUntil');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check soft lockout (15 minutes after 5 consecutive failures)
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
    throw new AppError(`Account is temporarily locked due to multiple failed login attempts. Please retry in ${remainingMinutes} minute(s).`, 429);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute soft lock
    }
    await user.save();
    throw new AppError('Invalid email or password', 401);
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;

  // If student is not verified yet, send fresh OTP and prompt modal
  if (!user.isEmailVerified && user.role !== 'admin') {
    const otp = user.generateEmailVerificationOTP();
    await user.save();
    sendVerificationOTPEmail({
      toEmail: user.email,
      name: user.name,
      otp,
    }).catch(err => console.error('Verification email error on login:', err.message));

    return {
      requiresVerification: true,
      email: user.email,
      message: 'Your account is pending verification. A fresh 6-digit code has been sent to your email.',
    };
  }

  const refreshToken = user.generateRefreshToken();
  await user.save();

  // Sync active Purchase records
  await syncUserPurchases(user);

  const token = user.getSignedJwtToken();

  return {
    token,
    refreshToken,
    user: formatUser(user),
  };
};

export const refreshUserToken = async (incomingToken) => {
  if (!incomingToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(incomingToken).digest('hex');

  const user = await User.findOne({
    refreshToken: hashedToken,
    refreshTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired refresh token. Please login again.', 401);
  }

  // Rotate refresh token
  const newRefreshToken = user.generateRefreshToken();
  await user.save();

  const newAccessToken = user.getSignedJwtToken();

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    user: formatUser(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await syncUserPurchases(user);
  return formatUser(user);
};

export const updateUserProfile = async (userId, { name, mobile }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name) user.name = String(name).trim().slice(0, 100);
  if (mobile !== undefined) user.mobile = String(mobile).trim().slice(0, 15);

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  };
};

export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new AppError('Please provide an email address', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    return { success: true, message: 'If this email is registered, password reset instructions have been sent.' };
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  sendPasswordResetEmail({
    toEmail: user.email,
    name: user.name,
    resetUrl,
  }).catch(err => console.error('Reset email error:', err.message));

  return {
    success: true,
    message: 'If this email is registered, password reset instructions have been sent.',
  };
};

export const resetUserPassword = async (tokenParam, password) => {
  if (!password || password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const resetPasswordToken = crypto.createHash('sha256').update(tokenParam).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const refreshToken = user.generateRefreshToken();
  await user.save();

  const token = user.getSignedJwtToken();

  return {
    token,
    refreshToken,
  };
};
