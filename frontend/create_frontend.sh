#!/bin/bash

# Create all frontend files

# API Service
cat > src/services/api.js << 'APIEOF'
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
  getPermissions: () => api.get('/users/permissions')
};

export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getStats: () => api.get('/jobs/stats')
};

export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  create: (data) => api.post('/applications', data),
  updateStatus: (id, status, notes) => api.put(`/applications/${id}/status`, { status, notes }),
  delete: (id) => api.delete(`/applications/${id}`)
};

export default api;
APIEOF

# Permissions Utility
cat > src/utils/permissions.js << 'PERMEOF'
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
PERMEOF

# Auth Context
cat > src/context/AuthContext.jsx << 'AUTHEOF'
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.clear();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { user, accessToken, refreshToken } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { user, accessToken, refreshToken } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
AUTHEOF

# Permissions Hook
cat > src/hooks/usePermissions.js << 'HOOKEOF'
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
HOOKEOF

echo "✓ Core files created"
