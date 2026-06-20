import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const RoutineList = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Sacamos al usuario logueado del contexto
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        // Apuntamos EXACTAMENTE a la ruta que armamos en el backend
        const response = await fetch("http://localhost:4000/api/routines/mis-rutinas", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include" // Clave para que mande tu cookie de sesión
        });

        if (response.ok) {
          const data = await response.json();
          setRoutines(data);
        } else {
          console.error("Error al obtener rutinas");
        }
      } catch (error) {
        console.error("Error de red:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []); // Se ejecuta una sola vez al cargar la página

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <span>←</span> Volver al Inicio
        </button>

        {/* CABECERA */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              {user?.role === "profesor" ? "Gestión de Rutinas" : "Tu Plan de Entrenamiento"}
            </h1>
            <p className="text-zinc-500 font-medium mt-1">
              {user?.role === "profesor" 
                ? "Administra las plantillas y asignaciones del gimnasio" 
                : "Selecciona tu rutina para comenzar el día"}
            </p>
          </div>
          
          {user?.role === "profesor" && (
            <Link 
              to="/teacher-panel"
              className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-800 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 justify-center"
            >
              <span>+</span> Nueva Rutina
            </Link>
          )}
        </header>

        {/* CONTENIDO (GRILLA DE RUTINAS) */}
        {routines.length === 0 ? (
          <div className="bg-white border border-dashed border-zinc-300 p-16 text-center rounded-3xl shadow-sm">
            <span className="text-4xl mb-4 block">📋</span>
            <h3 className="text-xl font-bold text-zinc-800 mb-2">Aún no hay rutinas</h3>
            <p className="text-zinc-500 max-w-md mx-auto">
              {user?.role === "profesor" 
                ? "No has creado ninguna rutina todavía. Haz clic en 'Nueva Rutina' para empezar a diseñar plantillas." 
                : "Tu profesor aún no te ha asignado un plan de entrenamiento."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <div key={routine._id} className="group bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between">
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-zinc-900 line-clamp-2">{routine.title}</h2>
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full whitespace-nowrap">
                      {routine.level}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                      <span>📅</span> {routine.days?.length || 0} Días de entrenamiento
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                      <span>⚡</span> {routine.days?.reduce((total, day) => total + day.exercises.length, 0) || 0} Ejercicios en total
                    </div>
                  </div>
                </div>

                {/* ACCIONES SEGÚN EL ROL */}
                <div className="pt-4 border-t border-zinc-100">
                  {user?.role === "profesor" ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/edit-routine/${routine._id}`)}
                        className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        className="py-2.5 px-4 bg-white border border-zinc-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        Borrar
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate(`/routine-view/${routine._id}`)}
                      className="w-full py-3 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-colors group-hover:shadow-md group-hover:-translate-y-0.5"
                    >
                      Iniciar Entrenamiento
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineList;