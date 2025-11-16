import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">Job Portal</Link>
        <div className="navbar-links">
          <Link to="/jobs">Jobs</Link>
          {user ? (
            <>
              {can('jobs:create') && <Link to="/jobs/create">Post Job</Link>}
              {can('applications:read') && <Link to="/applications">Applications</Link>}
              {can('admin:access') && <Link to="/admin">Admin</Link>}
              <span>Hi, {user.name}!</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;