const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const connectDB = require('../config/database');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    
    logger.info('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@jobportal.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1234567890',
      bio: 'System administrator'
    });

    const employer1 = await User.create({
      name: 'Tech Corp HR',
      email: 'hr@techcorp.com',
      password: 'Employer@123',
      role: 'employer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      phone: '+1234567891'
    });

    const employer2 = await User.create({
      name: 'StartupXYZ Recruiter',
      email: 'jobs@startupxyz.com',
      password: 'Employer@123',
      role: 'employer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      phone: '+1234567892'
    });

    const candidate1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@email.com',
      password: 'Candidate@123',
      role: 'candidate',
      phone: '+1234567893',
      location: 'Boston, MA',
      bio: 'Full-stack developer with 5 years experience',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
      experience: [{
        title: 'Senior Developer',
        company: 'Previous Company',
        startDate: new Date('2019-01-01'),
        endDate: new Date('2024-01-01'),
        description: 'Led development team'
      }],
      education: [{
        degree: 'BS Computer Science',
        institution: 'MIT',
        year: 2018
      }]
    });

    const candidate2 = await User.create({
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      password: 'Candidate@123',
      role: 'candidate',
      phone: '+1234567894',
      location: 'Seattle, WA',
      bio: 'UI/UX Designer passionate about user experience',
      skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
      education: [{
        degree: 'BA Design',
        institution: 'Stanford',
        year: 2020
      }]
    });

    const viewer = await User.create({
      name: 'Guest User',
      email: 'guest@email.com',
      password: 'Viewer@123',
      role: 'viewer'
    });

    logger.info('Created users');

    // Create jobs
    const job1 = await Job.create({
      title: 'Senior Full Stack Developer',
      description: 'We are seeking an experienced full stack developer to join our growing team...',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      salary: { min: 120000, max: 180000, currency: 'USD' },
      type: 'full-time',
      experienceLevel: 'senior',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
      requirements: ['5+ years experience', 'Strong communication skills'],
      benefits: ['Health insurance', '401k', 'Remote work'],
      postedBy: employer1._id,
      status: 'open'
    });

    const job2 = await Job.create({
      title: 'UI/UX Designer',
      description: 'Looking for a creative UI/UX designer to craft beautiful user experiences...',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary: { min: 80000, max: 120000, currency: 'USD' },
      type: 'full-time',
      experienceLevel: 'mid',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      requirements: ['3+ years experience', 'Portfolio required'],
      benefits: ['Health insurance', 'Equity', 'Flexible hours'],
      postedBy: employer2._id,
      status: 'open'
    });

    const job3 = await Job.create({
      title: 'Frontend Developer Intern',
      description: 'Internship opportunity for aspiring frontend developers...',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      salary: { min: 30000, max: 40000, currency: 'USD' },
      type: 'internship',
      experienceLevel: 'entry',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      requirements: ['Currently pursuing CS degree'],
      benefits: ['Learning opportunities', 'Mentorship'],
      postedBy: employer1._id,
      status: 'open'
    });

    logger.info('Created jobs');

    // Create applications
    const app1 = await Application.create({
      job: job1._id,
      applicant: candidate1._id,
      coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With over 5 years of experience...',
      status: 'reviewing'
    });

    const app2 = await Application.create({
      job: job2._id,
      applicant: candidate2._id,
      coverLetter:"As a passionate UI/UX designer with a strong portfolio, I would love to contribute to StartupXYZ and help create amazing user experiences...",
      status: 'shortlisted'
    });

    logger.info('Created applications');

    logger.info('✅ Database seeded successfully!');
    logger.info('\n📧 Login Credentials:');
    logger.info('Admin: admin@jobportal.com / Admin@123');
    logger.info('Employer1: hr@techcorp.com / Employer@123');
    logger.info('Employer2: jobs@startupxyz.com / Employer@123');
    logger.info('Candidate1: john.doe@email.com / Candidate@123');
    logger.info('Candidate2: jane.smith@email.com / Candidate@123');
    logger.info('Viewer: guest@email.com / Viewer@123');

    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', { error: error.message });
    process.exit(1);
  }
};

seedData();
