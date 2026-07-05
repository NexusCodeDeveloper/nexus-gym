import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

  // Si hay roles permitidos, y el usuario no es superAdmin, y su rol no está en la lista, se redirige.
  if (allowedRoles && user?.role !== 'superAdmin' && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;