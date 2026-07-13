import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../../utils/swal';
import api from '../../service/api.js';

const VideoPickerModal = ({ onSelect, onClose, videos }) => {
  const [search, setSearch] = useState('');
  const filtered = videos.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-100">Seleccionar video</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl">✕</button>
        </div>
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1 overflow-y-auto space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">No se encontraron videos. Subí algunos desde la Librería.</p>
          ) : (
            filtered.map(v => (
              <button
                key={v._id}
                onClick={() => { onSelect(v.videoUrl); onClose(); }}
                className="w-full flex items-center gap-4 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors text-left"
              >
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                  <video src={v.videoUrl} className="w-full h-full object-cover" preload="metadata" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-200 truncate">{v.name}</p>
                  <p className="text-xs text-zinc-500">{v.category}</p>
                </div>
                <span className="text-blue-400 text-sm font-semibold">Seleccionar</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TeacherPanel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [showVideoPicker, setShowVideoPicker] = useState(null);
  const [libraryVideos, setLibraryVideos] = useState([]);
  
  const [routine, setRoutine] = useState({
    title: '',
    level: 'Principiante',
    students: [],
    assignedToAll: false,
    days: [{ dayName: 'Lunes', exercises: [{ name: '', sets: '', reps: '', rest: '', videoUrl: '' }] }]
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [alumnosRes, videosRes] = await Promise.all([
          api.get("/api/auth/alumnos"),
          api.get("/api/exercise-media").catch(() => ({ data: [] })),
        ]);
        setAlumnos(alumnosRes.data);
        setLibraryVideos(videosRes.data);

        if (isEditing) {
          const routineRes = await api.get(`/api/routines/${id}`);
          setRoutine(routineRes.data);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        if (isEditing) navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditing, navigate]);

  // FUNCIONES AUXILIARES (¡Estas eran las que probablemente faltaban!)
  const addDay = () => {
    if (routine.days.length >= 7) return;
    const newDay = { dayName: DIAS_SEMANA[routine.days.length], exercises: [] };
    setRoutine({ ...routine, days: [...routine.days, newDay] });
  };

  const removeDay = (index) => {
    if (routine.days.length === 1) return;
    const newDays = routine.days.filter((_, i) => i !== index);
    setRoutine({ ...routine, days: newDays });
    setActiveDayIndex(0);
  };

  const addExercise = () => {
    const newDays = [...routine.days];
    newDays[activeDayIndex].exercises.push({ name: '', sets: '', reps: '', rest: '', videoUrl: '' });
    setRoutine({ ...routine, days: newDays });
  };

  const removeExercise = (eIndex) => {
    const newDays = [...routine.days];
    newDays[activeDayIndex].exercises.splice(eIndex, 1);
    setRoutine({ ...routine, days: newDays });
  };

  const updateExercise = (eIndex, field, value) => {
    const newDays = [...routine.days];
    newDays[activeDayIndex].exercises[eIndex][field] = value;
    setRoutine({ ...routine, days: newDays });
  };

  const toggleStudent = (id) => {
    setRoutine(prev => ({
      ...prev,
      students: prev.students.includes(id) ? prev.students.filter(s => s !== id) : [...prev.students, id]
    }));
  };

  const handleSaveRoutine = async () => {
    if (!routine.title) return showErrorToast("Por favor, ponle un título a la rutina");
    if (!routine.assignedToAll && routine.students.length === 0) return showErrorToast("Seleccioná al menos un alumno o marcá 'Para todos'");

    const url = isEditing ? `/api/routines/${id}` : "/api/routines/create";
    const method = isEditing ? "PUT" : "POST";

    try {
      await api({ url, method, data: routine });

      showSuccessToast(isEditing ? "¡Rutina actualizada!" : "¡Rutina guardada!");
      navigate(-1);

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ocurrió un error al guardar la rutina";
      showErrorToast(errorMessage);
      console.error("Error guardando rutina:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-2">
            <span>←</span> Volver
          </button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-8">{isEditing ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h1>
        
        {/* INFO GENERAL */}
        <div className="mb-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setRoutine({ ...routine, assignedToAll: true, students: [] })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${routine.assignedToAll ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Para todos los alumnos
            </button>
            <button
              type="button"
              onClick={() => setRoutine({ ...routine, assignedToAll: false })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${!routine.assignedToAll ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Seleccionar alumnos
            </button>
          </div>

          {routine.assignedToAll ? (
            <p className="text-xs text-zinc-500">Esta rutina se asignará a <span className="text-zinc-300 font-semibold">todos los alumnos</span> del gimnasio.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {alumnos.length === 0 ? (
                <p className="text-xs text-zinc-500">No hay alumnos disponibles.</p>
              ) : (
                alumnos.map(a => (
                  <button
                    key={a._id}
                    type="button"
                    onClick={() => toggleStudent(a._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      routine.students.includes(a._id)
                        ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {routine.students.includes(a._id) ? '✓ ' : ''}{a.name}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-300 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Título de la rutina" value={routine.title} onChange={(e) => setRoutine({...routine, title: e.target.value})} />
            <select value={routine.level} onChange={(e) => setRoutine({...routine, level: e.target.value})} className="p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="Principiante" className="text-xs">Principiante</option>
            <option value="Intermedio" className="text-xs">Intermedio</option>
            <option value="Avanzado" className="text-xs">Avanzado</option>
          </select>
        </div>
        </div>

        {/* NAVBAR DÍAS */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {routine.days.map((day, index) => (
            <button key={index} onClick={() => setActiveDayIndex(index)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${activeDayIndex === index ? 'bg-blue-600 text-white' : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
              {day.dayName}
              <span className="ml-2 text-blue-200 hover:text-white" onClick={(e) => { e.stopPropagation(); removeDay(index); }}>✕</span>
            </button>
          ))}
          {routine.days.length < 7 && <button onClick={addDay} className="flex-shrink-0 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-zinc-400 hover:bg-zinc-700 transition-colors">+</button>}
        </div>

        {/* LISTA EJERCICIOS */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          {routine.days[activeDayIndex]?.exercises.map((ex, eIndex) => (
              <div key={eIndex} className="bg-zinc-800 p-3 sm:p-4 mb-4 rounded-xl border border-zinc-700 relative">
              <button onClick={() => removeExercise(eIndex)} className="absolute top-2 right-2 sm:top-3 sm:right-3 text-red-500 hover:text-red-400 font-bold text-base sm:text-lg">✕</button>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <input placeholder="Nombre del Ejercicio" value={ex.name} onChange={(e) => updateExercise(eIndex, 'name', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 col-span-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs" />
                <input placeholder="Series" value={ex.sets} onChange={(e) => updateExercise(eIndex, 'sets', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs" />
                <input placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(eIndex, 'reps', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs" />
                <input placeholder="Descanso" value={ex.rest} onChange={(e) => updateExercise(eIndex, 'rest', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs" />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                <div className="flex items-center gap-2 flex-1">
                  <input placeholder="URL del video" value={ex.videoUrl || ''} onChange={(e) => updateExercise(eIndex, 'videoUrl', e.target.value)} className="flex-1 p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-0" />
                  <button
                    type="button"
                    onClick={() => setShowVideoPicker(eIndex)}
                    className="shrink-0 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                  >
                    📁
                  </button>
                </div>
                {ex.videoUrl && (
                  <button
                    type="button"
                    onClick={() => updateExercise(eIndex, 'videoUrl', '')}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold text-center"
                  >
                    ✕ Quitar video
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addExercise} className="w-full py-4 border-2 border-dashed border-zinc-700 text-zinc-400 rounded-xl mt-4 hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors">+ Agregar ejercicio</button>
        </div>

        <button onClick={handleSaveRoutine} className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-colors">
          {isEditing ? 'Guardar Cambios' : 'Guardar Rutina'}
        </button>
      </div>

      {showVideoPicker !== null && (
        <VideoPickerModal
          videos={libraryVideos}
          onSelect={(url) => updateExercise(showVideoPicker, 'videoUrl', url)}
          onClose={() => setShowVideoPicker(null)}
        />
      )}
    </div>
  );
};

export default TeacherPanel;