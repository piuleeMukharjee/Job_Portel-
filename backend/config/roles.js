// Role definitions for the job portal
const ROLES = {
  ADMIN: 'admin',
  EMPLOYER: 'employer', // Can post jobs
  CANDIDATE: 'candidate', // Can apply for jobs
  VIEWER: 'viewer' // Read-only access
};

const ROLE_HIERARCHY = {
  admin: 4,
  employer: 3,
  candidate: 2,
  viewer: 1
};

const ROLE_DESCRIPTIONS = {
  admin: 'Full system access - can manage users, jobs, and applications',
  employer: 'Can create and manage job postings, review applications',
  candidate: 'Can view jobs and submit applications',
  viewer: 'Read-only access to public job listings'
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_DESCRIPTIONS
};
