const Job = require('../models/Job');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Get all jobs with filtering
 */
const getAllJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      experienceLevel, 
      location,
      search,
      status = 'open'
    } = req.query;

    const query = {};
    
    // Public users only see open jobs
    if (!req.user || req.user.role === 'viewer' || req.user.role === 'candidate') {
      query.status = 'open';
    } else if (status) {
      query.status = status;
    }

    if (type) query.type = type;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) {
      query.$text = { $search: search };
    }

    // Employers see only their jobs unless they're searching all
    if (req.user && req.user.role === 'employer' && !req.query.all) {
      query.postedBy = req.user.userId;
    }

    const jobs = await Job.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    logger.error('Get jobs error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

/**
 * Get job by ID
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Only show open jobs to candidates/viewers
    if (job.status !== 'open' && (!req.user || 
        (req.user.role !== 'admin' && req.user.userId !== job.postedBy.toString()))) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    logger.error('Get job error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

/**
 * Create new job
 */
const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.userId
    };

    const job = new Job(jobData);
    await job.save();

    await AuditLog.log({
      user: req.user.userId,
      action: 'job.create',
      resource: 'job',
      resourceId: job._id,
      details: { title: job.title, company: job.company },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('Job created', {
      jobId: job._id,
      userId: req.user.userId,
      correlationId: req.correlationId
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    logger.error('Create job error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
};

/**
 * Update job
 */
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const before = job.toObject();
    Object.assign(job, req.body);
    await job.save();

    await AuditLog.log({
      user: req.user.userId,
      action: 'job.update',
      resource: 'job',
      resourceId: job._id,
      changes: { before, after: job.toObject() },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('Job updated', {
      jobId: job._id,
      userId: req.user.userId,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
  } catch (error) {
    logger.error('Update job error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
};

/**
 * Delete job
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await AuditLog.log({
      user: req.user.userId,
      action: 'job.delete',
      resource: 'job',
      resourceId: job._id,
      details: { title: job.title, company: job.company },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      correlationId: req.correlationId
    });

    logger.info('Job deleted', {
      jobId: job._id,
      userId: req.user.userId,
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    logger.error('Delete job error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};

/**
 * Get job statistics
 */
const getJobStats = async (req, res) => {
  try {
    const query = req.user.role === 'employer' 
      ? { postedBy: req.user.userId }
      : {};

    const stats = await Job.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalApplications: { $sum: '$applicationsCount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get job stats error', {
      error: error.message,
      correlationId: req.correlationId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job statistics'
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
};
