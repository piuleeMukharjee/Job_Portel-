export const ROLES = {
  ADMIN: 'admin',
  EMPLOYER: 'employer',
  CANDIDATE: 'candidate',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  'users:read': ['admin'],
  'users:update': ['admin'],
  'users:delete': ['admin'],
  'users:changeRole': ['admin'],
  'jobs:read': ['admin', 'employer', 'candidate', 'viewer'],
  'jobs:create': ['admin', 'employer'],
  'jobs:update': ['admin', 'employer'],
  'jobs:delete': ['admin', 'employer'],
  'applications:read': ['admin', 'employer', 'candidate'],
  'applications:create': ['admin', 'candidate'],
  'applications:updateStatus': ['admin', 'employer'],
  'admin:access': ['admin'],
  'stats:read': ['admin', 'employer']
};

export const hasPermission = (role, permission) => {
  return PERMISSIONS[permission]?.includes(role) || false;
};
