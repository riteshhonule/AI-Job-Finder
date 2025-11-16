import React, { useState, useEffect } from 'react';
import jobsService from '../api/jobsService';
import './AdminJobs.css';

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary_min: '',
    salary_max: '',
    job_type: 'full-time',
    url: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await jobsService.getJobs();
      setJobs(data.results || []);
    } catch (err) {
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await jobsService.createJob(formData);
      setSuccess('Job created successfully!');
      setFormData({
        title: '',
        company: '',
        description: '',
        location: '',
        salary_min: '',
        salary_max: '',
        job_type: 'full-time',
        url: '',
      });
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      setError('Failed to create job.');
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsService.deleteJob(id);
        setSuccess('Job deleted successfully!');
        fetchJobs();
      } catch (err) {
        setError('Failed to delete job.');
      }
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading jobs...</div></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>⚙️ Admin - Job Management</h1>
        <p>Create and manage job listings</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? '✕ Cancel' : '+ Add New Job'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create New Job</h2>
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-row">
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select name="job_type" value={formData.job_type} onChange={handleChange}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Salary Min</label>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Salary Max</label>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-success">
              Create Job
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>All Jobs ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p className="no-data">No jobs found. Create one to get started!</p>
        ) : (
          <div className="jobs-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location || '-'}</td>
                    <td>{job.job_type}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminJobs;
