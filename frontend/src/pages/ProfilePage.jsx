import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  // 1. Nos conectamos a la "nube" y ahora también extraemos la función 'logout'
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Le decimos al backend que elimine la cookie del navegador
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      // 2. Le decimos al contexto que borre la memoria de React
      logout();
      // 3. Echamos al usuario al Login
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-6 text-yellow-500">Mi Perfil</h1>

      {/* 2. Mostramos los datos del usuario usando optional chaining (?) por seguridad */}
      <div className="text-left bg-zinc-700 p-4 rounded-md mb-6">
        <p className="text-xl mb-2">
          <span className="font-bold text-green-400">Nombre:</span> {user?.name}
        </p>
        <p className="text-xl mb-2">
          <span className="font-bold text-green-400">Email:</span> {user?.email}
        </p>
        <p className="text-xl">
          <span className="font-bold text-green-400">Rol:</span> {user?.role}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors w-full"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

export default ProfilePage;
