import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { can } = usePermissions();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await jobsAPI.getAll();
      setJobs(data.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Available Jobs</h1>
        {can('jobs:create') && (
          <button onClick={() => navigate('/jobs/create')} className="btn-primary">
            Post a Job
          </button>
        )}
      </div>
      
      {jobs.length === 0 ? (
        <p>No jobs available at the moment.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job._id} className="job-card" onClick={() => navigate(`/jobs/${job._id}`)}>
              <h3>{job.title}</h3>
              <p style={{ color: '#6B7280', marginBottom: '12px' }}>{job.company}</p>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {job.description.substring(0, 150)}...
              </p>
              <div className="job-card-meta">
                <span>📍 {job.location}</span>
                <span>💼 {job.type}</span>
                <span>📊 {job.experienceLevel}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;