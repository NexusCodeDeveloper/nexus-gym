import axios from "axios";

const API_URL = "http://localhost:4000/api/routines";

export const createRoutine = async (routineData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, routineData, {
      withCredentials: true, 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error creating the routine");
  }
};