import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// 1. creamos el contexto
export const AuthContext = createContext();

// 2. Creamos un hook personalizado
// en vez de importar 3 cosas distintas en cada página, solo importamos "useAuth"
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// 3. creamos el provider
export const AuthProvider = ({ children }) => {
  // guardamos los datos del usuario
  const [user, setUser] = useState(null);
  // Aquí guardamos si está logueado o no (true o false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para saber si la app apenas está comprobando la sesión
  const [loading, setLoading] = useState(true);
  // Función que llamaremos cuando el usuario haga login con éxito
  const signin = (userData) => {
    setUser(userData); // guarda los datos que vienen del backend
    setIsAuthenticated(true); // cambia el estado a logueado
  };
  // Función que llamaremos cuando el usuario cierre sesión
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Función que se ejecuta automáticamente cuando entras a la app o presionas F5
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Vamos al backend a preguntar si la cookie es válida
        const res = await axios.get("http://localhost:4000/api/auth/profile", {
          withCredentials: true,
        });
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("⨷ ERROR AL RECARGAR SESIÓN:", error.response?.data || error.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Terminamos de comprobar
      }
    };
    checkLogin();
  }, []); // El array vacío significa que solo se ejecuta UNA vez al cargar

  return (
    // Todo lo que pongamos en 'value' será accesible desde cualquier página
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, signin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
