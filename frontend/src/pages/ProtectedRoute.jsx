import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  // 1. Pantalla de carga mientras consulta al backend
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent rounded-full"></div>
    </div>
  );

  // 2. Si no hay sesión válida, patada al login
  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

  // 3. LA MAGIA DE LOS ROLES Y EL PASE VIP:
  // Si la ruta exige roles específicos, miramos quién está intentando entrar.
  // PERO si el usuario es 'super_adm', se salta esta restricción y pasa directo.
  if (allowedRoles && user?.role !== 'super_adm' && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />; 
  }

  // Si todo está bien, abrimos la puerta
  return <Outlet />;
}

export default ProtectedRoute;