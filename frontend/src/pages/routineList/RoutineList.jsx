import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import axios from 'axios';
import { showSuccessToast, showErrorToast, showDeleteConfirmDialog } from '../../utils/swal';

const RoutineList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/routines/mis-rutinas", { withCredentials: true });
        setRoutines(response.data);
      } catch (error) {
        console.error("Error cargando rutinas:", error);
        showErrorToast("No se pudieron cargar las rutinas.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  const handleDeleteRoutine = async (id) => {
    const isConfirmed = await showDeleteConfirmDialog({
      title: '¿Eliminar esta rutina?',
      text: 'Esta acción es permanente.'
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:4000/api/routines/${id}`, { withCredentials: true });
      setRoutines(routines.filter(routine => routine._id !== id));
      showSuccessToast("Rutina eliminada con éxito.");
    } catch (error) {
      showErrorToast("Error al eliminar la rutina.");
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Cargando rutinas...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"><span>←</span> Volver al Inicio</button>

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
              {user?.role === "profesor" || user?.role === "admin" ? "Gestión de Rutinas" : "Tu Plan de Entrenamiento"}
            </h1>
          </div>
          {(user?.role === "profesor" || user?.role === "admin") && (
            <Link to="/teacherPanel" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2 justify-center">
              <span>+</span> Nueva Rutina
            </Link>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.length > 0 ? routines.map((routine) => (
            <div key={routine._id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 mb-2">{routine.title}</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  routine.level === 'Principiante' ? 'bg-green-500/10 text-green-400' :
                  routine.level === 'Intermedio' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{routine.level}</span>
              </div>
              <div className="pt-4 border-t border-zinc-800 mt-6">
                {(user?.role === "profesor" || user?.role === "admin") ? (
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/editRoutine/${routine._id}`)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 text-sm font-bold rounded-xl hover:bg-zinc-700 transition-colors">Editar</button>
                    <button onClick={() => handleDeleteRoutine(routine._id)} className="py-2.5 px-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/20 transition-colors">Borrar</button>
                  </div>
                ) : (
                  <button onClick={() => navigate(`/routineView/${routine._id}`)} className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors">Iniciar Entrenamiento</button>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-16 bg-zinc-900 border border-dashed border-zinc-800 rounded-3xl">
              <h3 className="text-lg font-semibold text-zinc-300">No hay rutinas para mostrar</h3>
              <p className="text-zinc-500 mt-1 text-sm">
                {user?.role === "profesor" || user?.role === "admin" 
                  ? "Crea una nueva rutina para empezar." 
                  : "Aún no te han asignado un plan de entrenamiento."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineList;