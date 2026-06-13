import axios from "axios";

// URL base de tu backend
const API_URL = "http://localhost:4000/api/auth";

export const verifyDni = async (dni) => {
  try {
    const response = await axios.post(
      `${API_URL}/verify-dni`,
      { dni },
      { withCredentials: true } 
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al comunicarse con el servidor");
  }
};