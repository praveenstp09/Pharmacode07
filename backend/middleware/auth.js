import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verifies JWT
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (dbErr) {
        console.error('Database connection error during auth verification:', dbErr.message);
        return res.status(503).json({ success: false, message: 'Database connection is temporarily recovering. Please retry in a moment.' });
      }
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found with this token' });
      }

      // Reject if account is temporarily locked
      if (req.user.lockUntil && req.user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((req.user.lockUntil.getTime() - Date.now()) / (60 * 1000));
        return res.status(403).json({
          success: false,
          message: `Account is temporarily locked due to multiple failed login attempts. Please retry in ${remainingMinutes} minute(s).`,
        });
      }

      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};

// Optional auth - populates req.user if JWT is provided, but does not block guests
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore invalid token and continue as guest
    }
  }
  next();
};
