import React, { useState, useEffect } from 'react';
import matchService from '../api/matchService';
import './Profile.css';

function Profile({ user }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState('intermediate');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await matchService.getSkills();
      setSkills(data);
    } catch (err) {
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      setError('Please enter a skill name.');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const skill = await matchService.addSkill(newSkill, proficiency);
      setSkills([...skills, skill]);
      setNewSkill('');
      setProficiency('intermediate');
      setSuccess('Skill added successfully!');
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to add skill.');
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading profile...</div></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your skills and profile information</p>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h2>Profile Information</h2>
          <div className="profile-info">
            <div className="info-item">
              <label>Username:</label>
              <span>{user?.username}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.first_name} {user?.last_name}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Add New Skill</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleAddSkill}>
            <div className="form-group">
              <label>Skill Name</label>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., Python, React, AWS"
              />
            </div>

            <div className="form-group">
              <label>Proficiency Level</label>
              <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Add Skill
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>Your Skills ({skills.length})</h2>
        {skills.length === 0 ? (
          <p className="no-data">No skills added yet. Add your first skill above!</p>
        ) : (
          <div className="skills-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Proficiency</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.name}</td>
                    <td>
                      <span className={`proficiency-badge ${skill.proficiency}`}>
                        {skill.proficiency}
                      </span>
                    </td>
                    <td>
                      {skill.extracted_from_resume ? '📄 Resume' : '✏️ Manual'}
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

export default Profile;
