import { createContext, useState, useContext, useEffect, useRef } from "react";
import { showConfirmDialog, showErrorToast, showLicenseAlert } from "../utils/swal";
import api from "../service/api.js";

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
  const alertShown = useRef(false);

  const signin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    checkLicenseAlert(userData);
  };

  const logout = async () => {
    const isConfirmed = await showConfirmDialog({
      title: '¿Quieres cerrar la sesión?',
      text: "Serás redirigido a la página de inicio de sesión.",
      confirmButtonText: 'Sí, cerrar sesión',
    });

    if (isConfirmed) {
      try {
        await api.post("/api/auth/logout", {});
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
      } catch (error) {
        console.error("Error al cerrar sesión", error);
        showErrorToast('Hubo un problema al cerrar sesión. Inténtalo de nuevo.');
      }
    }
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
  };

  function checkLicenseAlert(userData) {
    if (!userData) return;
    const role = userData.role;
    const endDateStr = userData.licenseEndDate;
    if (role === 'superAdmin' || !endDateStr || alertShown.current) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft >= 0 && daysLeft <= 2) {
      alertShown.current = true;
      showLicenseAlert(daysLeft);
    }
  }

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        const userData = res.data;
        setUser(userData);
        setIsAuthenticated(true);
        checkLicenseAlert(userData);
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
