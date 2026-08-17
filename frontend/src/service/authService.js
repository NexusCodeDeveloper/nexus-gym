import api from './api';

export const verifyDni = async (dni) => {
  try {
    const response = await api.post('/api/auth/verify-dni', { dni });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error al comunicarse con el servidor';
    const err = new Error(message);
    err.response = error.response;
    throw err;
  }
};
