
const API_URL = 'http://localhost:4000/api/auth'; 

export const verifyDni = async (dni) => {
  try {
    const response = await fetch(`${API_URL}/verify-dni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dni }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || ERROR_MESSAGES.DNI_NOT_FOUND);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
  }
};