const Application = require('../models/Application');
const Job = require('../models/Job');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, jobId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (jobId) query.job = jobId;
    
    // Filter by user role
    if (req.user.role === 'candidate') {
      query.applicant = req.user.userId;
    } else if (req.user.role === 'employer') {
      const jobs = await Job.find({ postedBy: req.user.userId }).select('_id');
      query.job = { $in: jobs.map(j => j._id) };
    }

    const applications = await Application.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    logger.error('Get applications error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

const createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, resume } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Job is not available' });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.userId
    });

    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user.userId,
      coverLetter,
      resume
    });

    await application.save();

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    await AuditLog.log({
      user: req.user.userId,
      action: 'application.create',
      resource: 'application',
      resourceId: application._id,
      details: { jobId },
      ipAddress: req.ip,
      correlationId: req.correlationId
    });

    logger.info('Application created', { applicationId: application._id });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    logger.error('Create application error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const notes = req.body.notes || '';

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await application.updateStatus(status, req.user.userId, notes);

    await AuditLog.log({
      user: req.user.userId,
      action: 'application.statusChange',
      resource: 'application',
      resourceId: application._id,
      details: { oldStatus: application.status, newStatus: status },
      ipAddress: req.ip,
      correlationId: req.correlationId
    });

    logger.info('Application status updated', { applicationId: application._id, status });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    logger.error('Update application status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    await AuditLog.log({
      user: req.user.userId,
      action: 'application.delete',
      resource: 'application',
      resourceId: application._id,
      ipAddress: req.ip,
      correlationId: req.correlationId
    });

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    logger.error('Delete application error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to delete application' });
  }
};

module.exports = {
  getAllApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
};
