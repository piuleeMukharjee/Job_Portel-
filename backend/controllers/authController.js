const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Only admins can create admin users
    let userRole = role || 'candidate';
    if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
      userRole = 'candidate';
      logger.warn('Non-admin attempted to create admin user', {
        email,
        correlationId: req.correlationId
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      role: userRole
    });

    await user.save();

    // Log audit
    await AuditLog.log({
      user: user._id,
      action: 'user.create',
      resource: 'user',
      resourceId: user._id,
      details: { email, role: userRole },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    // Generate tokens
    const tokens = generateTokenPair(user._id, user.email, user.role);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      await AuditLog.log({
        action: 'auth.login',
        resource: 'auth',
        details: { email, reason: 'User not found' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId,
        success: false
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      await AuditLog.log({
        user: user._id,
        action: 'auth.login',
        resource: 'auth',
        details: { email, reason: 'Account deactivated' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId,
        success: false
      });

      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await AuditLog.log({
        user: user._id,
        action: 'auth.login',
        resource: 'auth',
        details: { email, reason: 'Invalid password' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        correlationId: req.correlationId,
        success: false
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const tokens = generateTokenPair(user._id, user.email, user.role);

    // Update user
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await AuditLog.log({
      user: user._id,
      action: 'auth.login',
      resource: 'auth',
      details: { email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId,
      success: true
    });

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user._id, user.email, user.role);

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Log token refresh
    await AuditLog.log({
      user: user._id,
      action: 'auth.tokenRefresh',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token
    await User.findByIdAndUpdate(req.user.userId, { refreshToken: null });

    // Log logout
    await AuditLog.log({
      user: req.user.userId,
      action: 'auth.logout',
      resource: 'auth',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('User logged out', {
      userId: req.user.userId,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get profile error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};
