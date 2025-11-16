import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.changeRole(userId, newRole);
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>User Management</h1>
      <div style={{ marginTop: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Current Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    style={{ padding: '6px', borderRadius: '4px' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="employer">Employer</option>
                    <option value="candidate">Candidate</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;