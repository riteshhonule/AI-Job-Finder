import apiClient from './apiClient';

const authService = {
  register: async (username, email, password, passwordConfirm, firstName, lastName) => {
    try {
      const response = await apiClient.post('/users/register/', {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/token/', {
        username,
        password,
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me/');
    return response.data;
  },

  updateProfile: async (bio, location, yearsExperience) => {
    const response = await apiClient.patch('/users/me/', {
      profile: {
        bio,
        location,
        years_experience: yearsExperience,
      },
    });
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
