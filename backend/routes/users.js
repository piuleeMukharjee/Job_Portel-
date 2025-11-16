const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { can } = require('../middleware/authorization');
const { idParamValidation, updateRoleValidation } = require('../utils/validators');
const {
  getAllUsers,
  getUserById,
  updateProfile,
  changeUserRole,
  deleteUser,
  getUserPermissions
} = require('../controllers/userController');

router.get('/', authenticate, can('users:read'), getAllUsers);
router.get('/permissions', authenticate, getUserPermissions);
router.get('/:id', authenticate, idParamValidation, getUserById);
router.put('/:id', authenticate, updateProfile);
router.put('/:id/role', authenticate, can('users:changeRole'), updateRoleValidation, changeUserRole);
router.delete('/:id', authenticate, can('users:delete'), idParamValidation, deleteUser);

module.exports = router;
