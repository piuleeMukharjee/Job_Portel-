import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'full-time',
    experienceLevel: 'mid',
    salary: { min: '', max: '', currency: 'USD' },
    skills: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
      await jobsAPI.create(jobData);
      toast.success('Job posted successfully!');
      navigate('/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Post a New Job</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Company *</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description *</label>
          <textarea
            rows="6"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            minLength="50"
          />
        </div>
        
        <div className="form-group">
          <label>Job Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Experience Level *</label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
          >
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead/Principal</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Skills (comma-separated)</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({...formData, skills: e.target.value})}
            placeholder="e.g. React, Node.js, MongoDB"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button type="button" onClick={() => navigate('/jobs')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;