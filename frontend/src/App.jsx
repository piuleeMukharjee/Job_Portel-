import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import JobList from './components/jobs/JobList';
import JobDetails from './components/jobs/JobDetails';
import CreateJob from './components/jobs/CreateJob';
import ApplicationList from './components/applications/ApplicationList';
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<JobList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              <Route path="/jobs/create" element={
                <ProtectedRoute requiredPermission="jobs:create">
                  <CreateJob />
                </ProtectedRoute>
              } />
              
              <Route path="/applications" element={
                <ProtectedRoute requiredPermission="applications:read">
                  <ApplicationList />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute requiredPermission="admin:access">
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute requiredPermission="admin:access">
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
