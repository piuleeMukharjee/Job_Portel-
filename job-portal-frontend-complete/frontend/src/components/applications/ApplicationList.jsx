import React, { useState, useEffect } from 'react';
import { applicationsAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { can } = usePermissions();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await applicationsAPI.getAll();
      setApplications(data.data.applications);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(appId, newStatus);
      toast.success('Status updated successfully');
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Applications</h1>
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div style={{ marginTop: '24px' }}>
          {applications.map(app => (
            <div key={app._id} style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3>{app.job?.title}</h3>
                  <p style={{ color: '#6B7280', margin: '8px 0' }}>
                    {app.applicant?.name} • {app.applicant?.email}
                  </p>
                  <p style={{ fontSize: '14px', marginTop: '12px' }}>{app.coverLetter}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: app.status === 'accepted' ? '#10B981' :
                               app.status === 'rejected' ? '#EF4444' :
                               app.status === 'shortlisted' ? '#F59E0B' : '#6B7280',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    {app.status}
                  </span>
                  
                  {can('applications:updateStatus') && (
                    <div style={{ marginTop: '12px' }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        style={{ padding: '6px', borderRadius: '4px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Accepted</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;