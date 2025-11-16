import apiClient from './apiClient';

const recommendationService = {
  getCareerPaths: async () => {
    const response = await apiClient.post('/recommendations/career-paths/');
    return response.data;
  },

  getSkillGaps: async (targetRole = 'Data Scientist') => {
    const response = await apiClient.post('/recommendations/skill-gaps/', {
      target_role: targetRole,
    });
    return response.data;
  },

  getCourses: async (targetRole = 'Data Scientist') => {
    const response = await apiClient.post('/recommendations/courses/', {
      target_role: targetRole,
    });
    return response.data;
  },
};

export default recommendationService;
