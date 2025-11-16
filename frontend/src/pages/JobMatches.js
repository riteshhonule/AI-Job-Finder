import React, { useState, useEffect } from 'react';
import matchService from '../api/matchService';
import './JobMatches.css';

function JobMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [minScore, setMinScore] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    fetchMatches(1);
  }, []);

  const fetchMatches = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await matchService.getMatches(page, pageSize);
      setMatches(data.results || data.matches || []);
      setCurrentPage(data.page || page);
      setTotalMatches(data.total_matches || 0);
      setTotalPages(data.total_pages || 1);
      setHasNext(data.has_next || false);
      setHasPrevious(data.has_previous || false);
    } catch (err) {
      console.error('Fetch matches error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to load matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatching = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setCurrentPage(1);
    try {
      const result = await matchService.runMatching({
        page: 1,
        page_size: pageSize,
        sort_by: sortBy
      });
      setSuccess(result.message || 'Matching completed successfully!');
      setMatches(result.matches || []);
      setTotalMatches(result.total_matches || 0);
      setTotalPages(result.total_pages || 1);
      setHasNext(result.has_next || false);
      setHasPrevious(result.has_previous || false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.message || 
                          'Failed to run matching. Please ensure you have added skills to your profile.';
      console.error('Full error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setSuccess('');
    setLoading(true);
    setError('');
    setCurrentPage(1);
    try {
      // Lower the minimum score threshold on each refresh to show different jobs
      const newRefreshCount = refreshCount + 1;
      const newMinScore = Math.max(0, 50 - (newRefreshCount * 10));  // 50, 40, 30, 20, 10, 0
      
      setRefreshCount(newRefreshCount);
      setMinScore(newMinScore);
      
      const result = await matchService.runMatching({
        page: 1,
        page_size: pageSize,
        sort_by: 'random',
        min_score: newMinScore  // Lower threshold to show more/different jobs
      });
      
      const jobsShown = result.total_matches;
      setSuccess(result.message || `Showing ${jobsShown} jobs with lower requirements!`);
      setMatches(result.matches || []);
      setTotalMatches(result.total_matches || 0);
      setTotalPages(result.total_pages || 1);
      setHasNext(result.has_next || false);
      setHasPrevious(result.has_previous || false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.message || 
                          'Failed to refresh results.';
      console.error('Full error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (hasNext) {
      await fetchMatches(currentPage + 1);
    }
  };

  const handlePreviousPage = async () => {
    if (hasPrevious) {
      await fetchMatches(currentPage - 1);
    }
  };

  const handlePageSizeChange = async (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    // Re-fetch matches with new page size
    if (totalMatches > 0) {
      setLoading(true);
      try {
        const data = await matchService.getMatches(1, newSize);
        setMatches(data.results || data.matches || []);
        setCurrentPage(data.page || 1);
        setTotalMatches(data.total_matches || 0);
        setTotalPages(data.total_pages || 1);
        setHasNext(data.has_next || false);
        setHasPrevious(data.has_previous || false);
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>💼 Job Matches</h1>
        <p>Find jobs that match your skills and experience</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card controls-section">
        <div className="controls-row">
          <button
            onClick={handleRunMatching}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Running Matching...' : '🔄 Run Job Matching'}
          </button>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={loading || totalMatches === 0}
            title="Refresh to get new recommendations"
          >
            🔃 Refresh Results
          </button>
          <select 
            value={pageSize} 
            onChange={handlePageSizeChange}
            className="page-size-select"
            disabled={loading}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="card">
          <p className="no-data">
            {loading ? 'Loading matches...' : 'No job matches found. Run matching to get started!'}
          </p>
        </div>
      ) : (
        <>
          <div className="matches-info">
            <p>Showing {matches.length} of {totalMatches} matches | Page {currentPage} of {totalPages}</p>
          </div>
          <div className="matches-list">
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-header">
                  <div>
                    <h3>{match.job_title}</h3>
                    <p className="company">{match.job_company}</p>
                  </div>
                  <div className={`match-score ${getScoreClass(match.match_score)}`}>
                    {match.match_score}%
                  </div>
                </div>

                <p className="description">{match.job_description.substring(0, 200)}...</p>

                <div className="match-details">
                  <div className="detail-item">
                    <strong>Matched Skills:</strong>
                    <div className="skills">
                      {match.matched_skills.map((skill, idx) => (
                        <span key={idx} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {match.missing_skills.length > 0 && (
                    <div className="detail-item">
                      <strong>Missing Skills:</strong>
                      <div className="skills">
                        {match.missing_skills.map((skill, idx) => (
                          <span key={idx} className="skill-badge missing">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button
              onClick={handlePreviousPage}
              className="btn btn-secondary"
              disabled={!hasPrevious || loading}
            >
              ← Previous
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className="btn btn-secondary"
              disabled={!hasNext || loading}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default JobMatches;
