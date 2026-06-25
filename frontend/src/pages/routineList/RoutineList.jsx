import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const RoutineList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/routines/mis-rutinas", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setRoutines(data);
        }
      } catch (error) {
        console.error("Error de red:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm("🚨 ¿Seguro que querés eliminar esta rutina?")) return;
    try {
      const response = await fetch(`http://localhost:4000/api/routines/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setRoutines(routines.filter(routine => routine._id !== id));
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"><span>←</span> Volver al Inicio</button>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
              {user?.role === "profesor" || user?.role === "admin" ? "Gestión de Rutinas" : "Tu Plan de Entrenamiento"}
            </h1>
          </div>
          {(user?.role === "profesor" || user?.role === "admin") && (
            <Link to="/teacherPanel" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 justify-center">
              <span>+</span> Nueva Rutina
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <div key={routine._id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2">{routine.title}</h2>
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full">{routine.level}</span>
              </div>
              <div className="pt-4 border-t border-zinc-100 mt-6">
                {(user?.role === "profesor" || user?.role === "admin") ? (
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/editRoutine/${routine._id}`)} className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors">Editar</button>
                    <button onClick={() => handleDeleteRoutine(routine._id)} className="py-2.5 px-4 bg-white border border-zinc-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors">Borrar</button>
                  </div>
                ) : (
                  <button onClick={() => navigate(`/routineView/${routine._id}`)} className="w-full py-3 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors">Iniciar Entrenamiento</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutineList;