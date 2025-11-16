import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const can = useMemo(() => {
    return (permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    };
  }, [user]);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isEmployer = useMemo(() => user?.role === 'employer', [user]);
  const isCandidate = useMemo(() => user?.role === 'candidate', [user]);
  const isViewer = useMemo(() => user?.role === 'viewer', [user]);

  return { can, isAdmin, isEmployer, isCandidate, isViewer };
};
