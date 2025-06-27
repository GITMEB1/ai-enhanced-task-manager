import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const authData = JSON.parse(token);
      if (authData.state?.token) {
        config.headers.Authorization = `Bearer ${authData.state.token}`;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Only redirect to login on authentication errors, not network errors
    if (error.response?.status === 401 && error.response?.data?.error) {
      console.log('Authentication failed, redirecting to login');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Add integration endpoints
export const integrationAPI = {
  getStatus: () => api.get('/integrations/status'),
  getInsights: () => api.get('/integrations/insights'),
  acceptSuggestion: (data: any) => api.post('/integrations/suggestions/accept', data),
  getGmailAuth: () => api.get('/integrations/gmail/auth'),
  getEmails: (params?: any) => api.get('/integrations/gmail/emails', { params }),
  convertEmailsToTasks: (emailIds: string[]) => 
    api.post('/integrations/gmail/convert-to-tasks', { email_ids: emailIds })
};

export default api; 