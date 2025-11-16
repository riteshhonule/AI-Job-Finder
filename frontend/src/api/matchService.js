import apiClient from './apiClient';

const matchService = {
  getMatches: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get('/ai/matches/', { 
        params: { 
          page, 
          page_size: pageSize 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('getMatches error:', error.response?.data || error.message);
      throw error;
    }
  },

  runMatching: async (options = {}) => {
    try {
      const { page = 1, page_size = 10, sort_by = 'score', min_score = 0 } = options;
      const response = await apiClient.post('/ai/matches/run_matching/', {
        page,
        page_size,
        sort_by,
        min_score
      });
      return response.data;
    } catch (error) {
      console.error('runMatching error:', error.response?.data || error.message);
      throw error;
    }
  },

  parseAndExtract: async () => {
    const response = await apiClient.post('/ai/matches/parse_and_extract/');
    return response.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/upload_resume/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getResume: async () => {
    const response = await apiClient.get('/users/resume/');
    return response.data;
  },

  getSkills: async () => {
    const response = await apiClient.get('/users/skills/');
    return response.data;
  },

  addSkill: async (name, proficiency = 'intermediate') => {
    const response = await apiClient.post('/users/skills/', {
      name,
      proficiency,
    });
    return response.data;
  },
};

export default matchService;
