const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    minlength: 50,
    maxlength: 5000
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: [true, 'Job type is required']
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead'],
    required: [true, 'Experience level is required']
  },
  skills: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'closed'],
    default: 'open'
  },
  applicationDeadline: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
jobSchema.index({ postedBy: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ type: 1, experienceLevel: 1 });
jobSchema.index({ location: 1 });

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job'
});

// Update applicationsCount when queried
jobSchema.pre(/^find/, function(next) {
  // Populate postedBy with basic info
  this.populate({
    path: 'postedBy',
    select: 'name email company'
  });
  next();
});

// Method to increment views
jobSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
