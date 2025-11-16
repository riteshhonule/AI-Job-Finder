import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import matchService from '../api/matchService';
import './Dashboard.css';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalSkills: 0,
    resumeUploaded: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [matches, skills, resume] = await Promise.all([
          matchService.getMatches(),
          matchService.getSkills(),
          matchService.getResume().catch(() => null),
        ]);

        setStats({
          totalMatches: matches.count || 0,
          totalSkills: skills.length || 0,
          resumeUploaded: !!resume,
        });
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="container"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="container dashboard">
      <div className="page-header">
        <h1>Welcome, {user?.first_name || user?.username}! 👋</h1>
        <p>Your personalized job matching dashboard</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>📄 Resume</h3>
          <p className="stat-value">{stats.resumeUploaded ? '✓ Uploaded' : '✗ Not Uploaded'}</p>
          <Link to="/resume" className="btn btn-primary">
            {stats.resumeUploaded ? 'Update Resume' : 'Upload Resume'}
          </Link>
        </div>

        <div className="stat-card">
          <h3>🎯 Skills</h3>
          <p className="stat-value">{stats.totalSkills}</p>
          <Link to="/profile" className="btn btn-primary">
            Manage Skills
          </Link>
        </div>

        <div className="stat-card">
          <h3>💼 Job Matches</h3>
          <p className="stat-value">{stats.totalMatches}</p>
          <Link to="/matches" className="btn btn-primary">
            View Matches
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Quick Start Guide</h2>
        <ol className="quick-start">
          <li>
            <strong>Upload Your Resume:</strong> Start by uploading your resume so we can extract your skills.
          </li>
          <li>
            <strong>Review Extracted Skills:</strong> Check and add any missing skills to your profile.
          </li>
          <li>
            <strong>Run Job Matching:</strong> Click "View Matches" to find jobs that match your skills.
          </li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
