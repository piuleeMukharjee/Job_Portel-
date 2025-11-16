const { hasPermission, isOwner } = require('../config/permissions');
const Job = require('../models/Job');
const Application = require('../models/Application');
const logger = require('../utils/logger');

/**
 * Check if user has a specific permission
 */
const can = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userHasPermission = hasPermission(req.user.role, permission);

    if (!userHasPermission) {
      logger.warn('Authorization denied', {
        userId: req.user.userId,
        role: req.user.role,
        permission,
        resource: req.originalUrl,
        correlationId: req.correlationId
      });

      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        requiredPermission: permission
      });
    }

    next();
  };
};

/**
 * Check if user can access/modify a job (ownership check)
 */
const canAccessJob = (action = 'read') => {
  return async (req, res, next) => {
    try {
      const jobId = req.params.id;
      const job = await Job.findById(jobId).select('postedBy status');

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Admins can access any job
      if (hasPermission(req.user.role, 'jobs:updateAny')) {
        req.job = job;
        return next();
      }

      // Check ownership for employers
      if (action === 'write') {
        if (!isOwner(req.user.userId, job.postedBy)) {
          logger.warn('Job access denied - not owner', {
            userId: req.user.userId,
            jobId: job._id,
            ownerId: job.postedBy,
            correlationId: req.correlationId
          });

          return res.status(403).json({
            success: false,
            message: 'You can only modify your own job postings'
          });
        }
      }

      req.job = job;
      next();
    } catch (error) {
      logger.error('Error checking job access', {
        error: error.message,
        correlationId: req.correlationId
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Check if user can access/modify an application (ownership check)
 */
const canAccessApplication = (action = 'read') => {
  return async (req, res, next) => {
    try {
      const applicationId = req.params.id;
      const application = await Application.findById(applicationId)
        .populate('job', 'postedBy')
        .select('applicant job status');

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Admins can access any application
      if (hasPermission(req.user.role, 'applications:readAny')) {
        req.application = application;
        return next();
      }

      // Candidates can access their own applications
      if (isOwner(req.user.userId, application.applicant)) {
        // Candidates can only read/update their own applications, not change status
        if (action === 'updateStatus') {
          return res.status(403).json({
            success: false,
            message: 'You cannot change the status of your own application'
          });
        }
        req.application = application;
        return next();
      }

      // Employers can access applications for their jobs
      if (application.job && isOwner(req.user.userId, application.job.postedBy)) {
        req.application = application;
        return next();
      }

      logger.warn('Application access denied', {
        userId: req.user.userId,
        applicationId: application._id,
        correlationId: req.correlationId
      });

      return res.status(403).json({
        success: false,
        message: 'You do not have access to this application'
      });
    } catch (error) {
      logger.error('Error checking application access', {
        error: error.message,
        correlationId: req.correlationId
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Require specific role(s)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role requirement not met', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        correlationId: req.correlationId
      });

      return res.status(403).json({
        success: false,
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
        requiredRoles: roles
      });
    }

    next();
  };
};

module.exports = {
  can,
  canAccessJob,
  canAccessApplication,
  requireRole
};
