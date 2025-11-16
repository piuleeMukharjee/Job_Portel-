const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { can, canAccessApplication } = require('../middleware/authorization');
const { applyJobLimiter } = require('../middleware/rateLimiter');
const {
  createApplicationValidation,
  updateApplicationStatusValidation,
  idParamValidation
} = require('../utils/validators');
const {
  getAllApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

router.get('/', authenticate, can('applications:read'), getAllApplications);
router.post('/', authenticate, can('applications:create'), applyJobLimiter, createApplicationValidation, createApplication);
router.put('/:id/status', authenticate, can('applications:updateStatus'), canAccessApplication('updateStatus'), updateApplicationStatusValidation, updateApplicationStatus);
router.delete('/:id', authenticate, can('applications:delete'), canAccessApplication('write'), idParamValidation, deleteApplication);

module.exports = router;
