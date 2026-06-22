import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";


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
    setUser(null);
    setIsAuthenticated(false);
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
      value={{ user, isAuthenticated, loading, signin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
