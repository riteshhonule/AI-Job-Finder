import React, { useState } from 'react';
import recommendationService from '../api/recommendationService';
import './Recommendations.css';

function Recommendations() {
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [careerPaths, setCareerPaths] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('career');

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const [careerData, gapsData, coursesData] = await Promise.all([
        recommendationService.getCareerPaths(),
        recommendationService.getSkillGaps(targetRole),
        recommendationService.getCourses(targetRole),
      ]);

      setCareerPaths(careerData.recommended_roles || []);
      setSkillGaps(gapsData.skill_gaps || []);
      setCourses(coursesData.courses || []);
    } catch (err) {
      setError('Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>🚀 Career Recommendations</h1>
        <p>Discover your career path and skill development opportunities</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Select Target Role</h2>
        <div className="role-selector">
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="role-select"
          >
            <option value="Data Scientist">Data Scientist</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
          </select>
          <button
            onClick={handleGetRecommendations}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>
      </div>

      {(careerPaths.length > 0 || skillGaps.length > 0 || courses.length > 0) && (
        <>
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'career' ? 'active' : ''}`}
              onClick={() => setActiveTab('career')}
            >
              🎯 Career Paths
            </button>
            <button
              className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              📚 Skill Gaps
            </button>
            <button
              className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              🎓 Courses
            </button>
          </div>

          {activeTab === 'career' && (
            <div className="card">
              <h2>Recommended Career Paths</h2>
              {careerPaths.length === 0 ? (
                <p className="no-data">No career paths available yet.</p>
              ) : (
                <div className="career-list">
                  {careerPaths.map((role, idx) => (
                    <div key={idx} className="career-item">
                      <h3>{role}</h3>
                      <p>Based on your current skills, you could transition to this role.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="card">
              <h2>Skill Gaps for {targetRole}</h2>
              {skillGaps.length === 0 ? (
                <p className="no-data">You have all the skills for this role!</p>
              ) : (
                <div className="skill-gaps-list">
                  {skillGaps.map((gap) => (
                    <div key={gap.id} className={`skill-gap-item priority-${gap.priority}`}>
                      <div className="gap-header">
                        <h3>{gap.skill_name}</h3>
                        <span className={`priority-badge ${gap.priority}`}>
                          {gap.priority}
                        </span>
                      </div>
                      <p>{gap.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="card">
              <h2>Recommended Courses</h2>
              {courses.length === 0 ? (
                <p className="no-data">No courses available for your skill gaps.</p>
              ) : (
                <div className="courses-list">
                  {courses.map((course) => (
                    <div key={course.id} className="course-item">
                      <div className="course-header">
                        <h3>{course.course_name}</h3>
                        <span className={`difficulty-badge ${course.difficulty}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <p className="provider">📌 {course.provider}</p>
                      <p className="skill-target">Target: {course.skill_target}</p>
                      {course.url && (
                        <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                          View Course
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Recommendations;
