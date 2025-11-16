const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const { getRolePermissions } = require('../config/permissions');

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    logger.error('Get all users error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.userId;
    
    // Users can only update their own profile unless they're admin
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const { password, email, role, ...updateData } = req.body;
    
    // Prevent non-admins from changing role
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your role'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const before = user.toObject();
    
    Object.assign(user, updateData);
    await user.save();

    await AuditLog.log({
      user: req.user.userId,
      action: 'user.update',
      resource: 'user',
      resourceId: user._id,
      changes: { before, after: user.toObject() },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('User profile updated', {
      userId: user._id,
      updatedBy: req.user.userId,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    logger.error('Update profile error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Change user role (Admin only)
 */
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.log({
      user: req.user.userId,
      action: 'user.roleChange',
      resource: 'user',
      resourceId: user._id,
      details: { oldRole, newRole: role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('User role changed', {
      userId: user._id,
      oldRole,
      newRole: role,
      changedBy: req.user.userId,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    logger.error('Change role error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to change user role'
    });
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting self
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await AuditLog.log({
      user: req.user.userId,
      action: 'user.delete',
      resource: 'user',
      resourceId: userId,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('User deleted', {
      userId: user._id,
      deletedBy: req.user.userId,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

/**
 * Get user permissions
 */
const getUserPermissions = async (req, res) => {
  try {
    const permissions = getRolePermissions(req.user.role);
    
    res.json({
      success: true,
      data: {
        role: req.user.role,
        permissions
      }
    });
  } catch (error) {
    logger.error('Get permissions error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  changeUserRole,
  deleteUser,
  getUserPermissions
};
