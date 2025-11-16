import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();
  const { can } = usePermissions();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: '#EF4444' }}>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;