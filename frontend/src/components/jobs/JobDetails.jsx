import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await jobsAPI.getById(id);
      setJob(data.data.job);
    } catch (error) {
      toast.error('Failed to load job');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsAPI.create({ jobId: id, coverLetter });
      toast.success('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div>Job not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/jobs')} style={{ marginBottom: '20px' }}>
        ← Back to Jobs
      </button>
      
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
        <h1>{job.title}</h1>
        <div style={{ display: 'flex', gap: '24px', margin: '16px 0', color: '#6B7280' }}>
          <span>🏢 {job.company}</span>
          <span>📍 {job.location}</span>
          <span>💼 {job.type}</span>
        </div>
        
        <div style={{ margin: '24px 0' }}>
          <h3>Description</h3>
          <p style={{ lineHeight: '1.8', color: '#374151' }}>{job.description}</p>
        </div>
        
        {job.salary && (
          <div style={{ margin: '24px 0' }}>
            <h3>Salary Range</h3>
            <p>{job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}</p>
          </div>
        )}
        
        {job.skills && job.skills.length > 0 && (
          <div style={{ margin: '24px 0' }}>
            <h3>Required Skills</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {job.skills.map((skill, idx) => (
                <span key={idx} style={{
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {can('applications:create') && (
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #E5E7EB' }}>
            <h3>Apply for this Position</h3>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  rows="6"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                  minLength="100"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>
              <button type="submit" disabled={applying} className="btn-primary">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;