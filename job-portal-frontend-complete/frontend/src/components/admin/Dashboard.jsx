import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginTop: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          cursor: 'pointer'
        }} onClick={() => navigate('/admin/users')}>
          <h3>User Management</h3>
          <p style={{ color: '#6B7280', marginTop: '8px' }}>Manage users and roles</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <h3>Job Statistics</h3>
          <p style={{ color: '#6B7280', marginTop: '8px' }}>View job metrics</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;