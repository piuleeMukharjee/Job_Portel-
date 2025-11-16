const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user.create',
      'user.update',
      'user.delete',
      'user.roleChange',
      'job.create',
      'job.update',
      'job.delete',
      'application.create',
      'application.update',
      'application.statusChange',
      'auth.login',
      'auth.logout',
      'auth.tokenRefresh'
    ]
  },
  resource: {
    type: String,
    enum: ['user', 'job', 'application', 'auth'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Flexible field for additional details
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  correlationId: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ correlationId: 1 });

// TTL index - automatically delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Static method to create log entry
auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .lean();
};

// Static method to get resource history
auditLogSchema.statics.getResourceHistory = async function(resource, resourceId) {
  return await this.find({ resource, resourceId })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .lean();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
