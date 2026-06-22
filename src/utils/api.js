import axios from 'axios';

const api = axios.create({
  baseURL: 'https://interview-tracker-api-m3rq.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApplications = async () => {
  try {
    const response = await api.get('/applications/');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

export const createApplication = async (applicationData) => {
  try {
    const response = await api.post('/applications/', applicationData);
    return response.data;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

export const updateApplication = async (id, applicationData) => {
  try {
    const response = await api.put(`/applications/${id}`, applicationData);
    return response.data;
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};

export const deleteApplication = async (id) => {
  try {
    await api.delete(`/applications/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};



export default api;