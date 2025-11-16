const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { can, canAccessJob } = require('../middleware/authorization');
const { createJobLimiter } = require('../middleware/rateLimiter');
const {
  createJobValidation,
  updateJobValidation,
  idParamValidation
} = require('../utils/validators');
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
} = require('../controllers/jobController');

router.get('/', optionalAuth, getAllJobs);
router.get('/stats', authenticate, can('stats:read'), getJobStats);
router.get('/:id', optionalAuth, idParamValidation, getJobById);
router.post('/', authenticate, can('jobs:create'), createJobLimiter, createJobValidation, createJob);
router.put('/:id', authenticate, can('jobs:update'), canAccessJob('write'), updateJobValidation, updateJob);
router.delete('/:id', authenticate, can('jobs:delete'), canAccessJob('write'), idParamValidation, deleteJob);

module.exports = router;
