import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const signin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    Swal.fire({
      title: '¿Quieres cerrar la sesión?',
      text: "Serás redirigido a la página de inicio de sesión.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'No, cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post("http://localhost:4000/api/auth/logout", {}, { 
            withCredentials: true 
          });
          setUser(null);
          setIsAuthenticated(false);
          window.location.href = '/login';
        } catch (error) {
          console.error("Error al cerrar sesión", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cerrar sesión. Inténtalo de nuevo.',
          });
        }
      }
    });
  };

  // 🔥 NUEVA FUNCIÓN: Permite actualizar el estado global del usuario en vivo
  const updateUser = (updatedData) => {
    setUser(updatedData);
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/auth/profile", {
          withCredentials: true,
        });
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []); 

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, signin, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};