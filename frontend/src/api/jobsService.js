import apiClient from './apiClient';

const jobsService = {
  getJobs: async (page = 1) => {
    const response = await apiClient.get('/jobs/', { params: { page } });
    return response.data;
  },

  searchJobs: async (query) => {
    const response = await apiClient.get('/jobs/search/', { params: { q: query } });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await apiClient.get(`/jobs/${id}/`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await apiClient.patch(`/jobs/${id}/`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    await apiClient.delete(`/jobs/${id}/`);
  },

  addSkillToJob: async (jobId, skillName, importance = 'required') => {
    const response = await apiClient.post(`/jobs/${jobId}/add_skill/`, {
      skill_name: skillName,
      importance,
    });
    return response.data;
  },
};

export default jobsService;
