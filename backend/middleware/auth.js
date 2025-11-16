const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authenticate user from JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user) {
      logger.warn('Token valid but user not found', {
        userId: decoded.userId,
        correlationId: req.correlationId
      });
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    if (!user.isActive) {
      logger.warn('Inactive user attempted access', {
        userId: user._id,
        email: user.email,
        correlationId: req.correlationId
      });
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token', {
        error: error.message,
        correlationId: req.correlationId
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired', {
        correlationId: req.correlationId
      });
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.'
      });
    }

    logger.error('Authentication error', {
      error: error.message,
      correlationId: req.correlationId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - adds user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password -refreshToken');
      
      if (user && user.isActive) {
        req.user = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name
        };
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
