const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      correlationId: req.correlationId
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      correlationId: req.correlationId
    });
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again in 15 minutes'
    });
  }
});

/**
 * Rate limiter for job creation
 */
const createJobLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 job posts per hour
  message: {
    success: false,
    message: 'Too many job postings, please try again later'
  },
  handler: (req, res) => {
    logger.warn('Job creation rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.userId,
      correlationId: req.correlationId
    });
    res.status(429).json({
      success: false,
      message: 'You can only post 10 jobs per hour'
    });
  }
});

/**
 * Rate limiter for application submissions
 */
const applyJobLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 applications per hour
  message: {
    success: false,
    message: 'Too many applications submitted, please try again later'
  },
  handler: (req, res) => {
    logger.warn('Application rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.userId,
      correlationId: req.correlationId
    });
    res.status(429).json({
      success: false,
      message: 'You can only submit 20 applications per hour'
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  createJobLimiter,
  applyJobLimiter
};
