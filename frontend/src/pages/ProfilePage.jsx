import { useAuth } from "../context/AuthContext.jsx";

function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-6 text-yellow-500">Mi Perfil</h1>

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
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors w-full"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

export default ProfilePage;
