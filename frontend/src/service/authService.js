import api from './api';

export const verifyDni = async (dni, gymId) => {
  try {
    const response = await api.post('/api/auth/verify-dni', { dni, gymId });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al comunicarse con el servidor';
    const err = new Error(message);
    err.response = error.response;
    throw err;
  }
};

export const fetchGyms = async () => {
  try {
    const response = await api.get('/api/auth/gyms');
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || 'Error al cargar los gimnasios';
    const err = new Error(message);
    err.response = error.response;
    throw err;
  }
};