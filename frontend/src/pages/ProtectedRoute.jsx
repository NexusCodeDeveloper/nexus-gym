import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== 'superAdmin' && user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSuspended = user.isActive === false;

    let isExpired = false;
    if (user.licenseEndDate) {
      const end = new Date(user.licenseEndDate);
      end.setHours(0, 0, 0, 0);
      isExpired = end < today;
    }

    if (isSuspended || isExpired) {
      return <Navigate to="/login" replace />;
    }
  }

  if (allowedRoles && user?.role !== 'superAdmin' && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
