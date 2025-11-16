import React, { useState, useEffect } from 'react';
import matchService from '../api/matchService';
import './ResumeUpload.css';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [showExtracted, setShowExtracted] = useState(false);
  const [resumeData, setResumeData] = useState({
    email: '',
    phone: '',
    raw_text: ''
  });

  // Load resume data on component mount
  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const data = await matchService.getResume();
        if (data && data.raw_text) {
          setResumeData({
            email: data.email || '',
            phone: data.phone || '',
            raw_text: data.raw_text || ''
          });
          setShowExtracted(true);
        }
        
        // Load extracted skills
        const skillsData = await matchService.getSkills();
        if (skillsData && Array.isArray(skillsData)) {
          const extractedSkillsList = skillsData
            .filter(skill => skill.extracted_from_resume)
            .map(skill => skill.name);
          if (extractedSkillsList.length > 0) {
            setExtractedSkills(extractedSkillsList);
          }
        }
      } catch (err) {
        console.error('Error loading resume data:', err);
      }
    };

    loadResumeData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      // Reset extracted data when user selects a new file
      setExtractedSkills([]);
      setResumeData({
        email: '',
        phone: '',
        raw_text: ''
      });
      setShowExtracted(false);
    } else {
      setError('Please select a valid PDF file.');
      setFile(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await matchService.uploadResume(file);
      setSuccess('Resume uploaded successfully!');
      setFile(null);

      // Parse and extract skills
      const result = await matchService.parseAndExtract();
      setExtractedSkills(result.skills);
      setResumeData({
        email: result.email || '',
        phone: result.phone || '',
        raw_text: result.raw_text || ''
      });
      setShowExtracted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📄 Upload Your Resume</h1>
        <p>Upload your resume to extract skills and find matching jobs</p>
      </div>

      <div className="card">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="resume-file"
              className="file-input"
            />
            <label htmlFor="resume-file" className="file-label">
              {file ? `Selected: ${file.name}` : 'Click to select PDF file'}
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload & Extract Skills'}
          </button>
        </form>
      </div>

      {showExtracted && (
        <>
          {extractedSkills.length > 0 && (
            <div className="card">
              <h2>✨ Extracted Skills</h2>
              <p>We found the following skills in your resume:</p>
              <div className="skills-container">
                {extractedSkills.map((skill, index) => (
                  <span key={index} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="info-text">
                These skills have been added to your profile. You can manage them in your profile settings.
              </p>
            </div>
          )}

          {resumeData.raw_text && (
            <div className="card">
              <h2>📋 Resume</h2>
              <p>Extracted information from your resume:</p>
              <table className="resume-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Extracted Text</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Email</td>
                    <td>{resumeData.email || 'Not found'}</td>
                  </tr>
                  <tr>
                    <td>Phone</td>
                    <td>{resumeData.phone || 'Not found'}</td>
                  </tr>
                  <tr>
                    <td>Resume Text</td>
                    <td className="resume-text-cell">
                      <div className="resume-text-preview">
                        {resumeData.raw_text}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="card info-card">
        <h2>ℹ️ Supported Formats</h2>
        <ul>
          <li>PDF files only</li>
          <li>Maximum file size: 10MB</li>
          <li>We extract skills, email, and phone number</li>
        </ul>
      </div>
    </div>
  );
}

export default ResumeUpload;
