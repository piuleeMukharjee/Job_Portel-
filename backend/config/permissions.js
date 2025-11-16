const { ROLES } = require('./roles');

// Permission definitions
const PERMISSIONS = {
  // User management
  'users:read': [ROLES.ADMIN],
  'users:create': [ROLES.ADMIN],
  'users:update': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  'users:changeRole': [ROLES.ADMIN],
  'users:readOwn': [ROLES.ADMIN, ROLES.EMPLOYER, ROLES.CANDIDATE, ROLES.VIEWER],
  'users:updateOwn': [ROLES.ADMIN, ROLES.EMPLOYER, ROLES.CANDIDATE, ROLES.VIEWER],

  // Job management
  'jobs:read': [ROLES.ADMIN, ROLES.EMPLOYER, ROLES.CANDIDATE, ROLES.VIEWER],
  'jobs:create': [ROLES.ADMIN, ROLES.EMPLOYER],
  'jobs:update': [ROLES.ADMIN, ROLES.EMPLOYER], // Employers can only update their own
  'jobs:delete': [ROLES.ADMIN, ROLES.EMPLOYER], // Employers can only delete their own
  'jobs:updateAny': [ROLES.ADMIN],
  'jobs:deleteAny': [ROLES.ADMIN],

  // Application management
  'applications:read': [ROLES.ADMIN, ROLES.EMPLOYER, ROLES.CANDIDATE],
  'applications:create': [ROLES.ADMIN, ROLES.CANDIDATE],
  'applications:update': [ROLES.ADMIN, ROLES.CANDIDATE], // Candidates can update their own
  'applications:delete': [ROLES.ADMIN, ROLES.CANDIDATE], // Candidates can delete their own
  'applications:updateStatus': [ROLES.ADMIN, ROLES.EMPLOYER], // For job owners
  'applications:readAny': [ROLES.ADMIN],

  // Admin actions
  'admin:access': [ROLES.ADMIN],
  'audit:read': [ROLES.ADMIN],
  'stats:read': [ROLES.ADMIN, ROLES.EMPLOYER]
};

/**
 * Check if a role has a specific permission
 */
const hasPermission = (role, permission) => {
  if (!PERMISSIONS[permission]) {
    return false;
  }
  return PERMISSIONS[permission].includes(role);
};

/**
 * Check if user owns a resource
 */
const isOwner = (userId, resourceOwnerId) => {
  return userId.toString() === resourceOwnerId.toString();
};

/**
 * Get all permissions for a role
 */
const getRolePermissions = (role) => {
  const permissions = [];
  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(role)) {
      permissions.push(permission);
    }
  }
  return permissions;
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  isOwner,
  getRolePermissions
};
