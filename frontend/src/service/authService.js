import axios from "axios";

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
    const message = error.response?.data?.message || "Error al comunicarse con el servidor";
    const err = new Error(message);
    err.response = error.response;
    throw err;
  }
};