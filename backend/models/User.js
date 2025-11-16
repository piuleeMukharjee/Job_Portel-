const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/roles');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CANDIDATE
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  resume: {
    type: String // URL to resume
  },
  profilePicture: {
    type: String // URL to profile picture
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (excluding sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

// Virtual for user's job count (if employer)
userSchema.virtual('jobsPosted', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'postedBy',
  count: true
});

// Virtual for user's application count (if candidate)
userSchema.virtual('applicationsCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'applicant',
  count: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
