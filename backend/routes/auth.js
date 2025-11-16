const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation } = require('../utils/validators');
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile
} = require('../controllers/authController');

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

module.exports = router;
