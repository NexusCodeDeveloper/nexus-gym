import api from './api';

export const createRoutine = async (routineData) => {
  try {
    const response = await api.post('/api/routines/create', routineData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error creating the routine');
  }
};
