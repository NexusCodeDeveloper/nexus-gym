import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="animate-spin h-8 w-8 border-4 border-zinc-900 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user?.role !== 'super_adm' && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;