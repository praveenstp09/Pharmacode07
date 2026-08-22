import crypto from 'crypto';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

const syncUserPurchases = async (user) => {
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

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  purchasedTests: (user.purchasedTests || []).map(t => (t?._id || t).toString()),
  purchasedMaterials: (user.purchasedMaterials || []).map(m => (m?._id || m).toString()),
  purchasedSingleModels: (user.purchasedSingleModels || []).map(m => (m?._id || m).toString()),
  purchasedNonPharma: (user.purchasedNonPharma || []).map(m => (m?._id || m).toString()),
});

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile ? mobile.trim() : '',
      password,
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Sync active Purchase records and remove expired ones
    await syncUserPurchases(user);

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Always sync active Purchase records and remove expired ones
    await syncUserPurchases(user);

    res.json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't disclose user existence for security
      return res.json({
        success: true,
        message: 'If this email is registered, password reset instructions have been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'If this email is registered, password reset instructions have been sent.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      message: 'Password reset successful',
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
