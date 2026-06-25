import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoutineView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/routines/${id}`, { 
          withCredentials: true 
        });
        setRoutine(response.data);
      } catch (error) {
        console.error("Error al cargar la rutina", error);
        alert("No se pudo cargar la rutina. Verificá tu conexión.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutine();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-medium">Preparando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (!routine) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <span>←</span> Volver a mis rutinas
        </button>

        <header className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">{routine.title}</h1>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full whitespace-nowrap">
              {routine.level}
            </span>
          </div>
          <p className="text-zinc-500 text-sm font-medium">
            ¡A darlo todo hoy! Seleccioná el día para ver tus ejercicios.
          </p>
        </header>

        {routine.days && routine.days.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              {routine.days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDayIndex(index)}
                  className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                    activeDayIndex === index 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-800 mb-4 px-1">
                Ejercicios para el {routine.days[activeDayIndex]?.dayName}
              </h2>
              
              {routine.days[activeDayIndex]?.exercises.length === 0 ? (
                <div className="bg-white border border-dashed border-zinc-300 p-8 text-center rounded-2xl">
                  <p className="text-zinc-500">Día de descanso o sin ejercicios asignados.</p>
                </div>
              ) : (
                routine.days[activeDayIndex]?.exercises.map((ex, idx) => (
                  <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-300">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-900">{ex.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8 bg-zinc-50 p-3 sm:p-4 rounded-xl border border-zinc-100">
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Series</span>
                        <span className="text-base font-black text-zinc-800">{ex.sets || '-'}</span>
                      </div>
                      <div className="w-px h-8 bg-zinc-200"></div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reps</span>
                        <span className="text-base font-black text-zinc-800">{ex.reps || '-'}</span>
                      </div>
                    </div>

                    {ex.videoUrl && (
                      <a 
                        href={ex.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-0 sm:h-12 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                      >
                        <span>▶</span> Ver Video
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="bg-white border border-dashed border-zinc-300 p-16 text-center rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-zinc-800 mb-2">Rutina vacía</h3>
            <p className="text-zinc-500">Esta rutina no tiene días configurados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineView;