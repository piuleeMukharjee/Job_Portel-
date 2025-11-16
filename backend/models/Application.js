const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    trim: true,
    minlength: 100,
    maxlength: 2000
  },
  resume: {
    type: String, // URL to resume
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Indexes for efficient queries
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// Populate references on find queries
applicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'applicant',
    select: 'name email phone skills experience education resume'
  }).populate({
    path: 'job',
    select: 'title company location type status'
  });
  next();
});

// Method to update status and log history
applicationSchema.methods.updateStatus = async function(newStatus, userId, notes = '') {
  this.status = newStatus;
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    changedAt: new Date(),
    notes
  });
  
  await this.save();
  return this;
};

// Static method to get application stats for a job
applicationSchema.statics.getJobStats = async function(jobId) {
  return await this.aggregate([
    { $match: { job: mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
