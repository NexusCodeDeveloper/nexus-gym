import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute() {
  // Traemos los datos de la nube
  const { isAuthenticated, loading } = useAuth();

  // 1. Si el sistema todavía está preguntándole al backend si tienes cookie (loading),
  // le decimos al usuario que espere un momento para no echarlo por error.
  if (loading) return <h1 className="text-2xl font-bold">Cargando...</h1>;

  // 2. Si ya terminó de cargar y NO estás logueado, lo mandamos  al /login
  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

  // 3. Si todo está bien, Outlet actúa como la "puerta abierta".
  // Deja renderizar el componente que esté adentro (en nuestro caso, el ProfilePage)
  return <Outlet />;
}

export default ProtectedRoute;
