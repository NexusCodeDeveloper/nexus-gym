import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/swal';

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TeacherPanel = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  
  const [routine, setRoutine] = useState({
    title: '',
    level: 'Principiante',
    studentId: '',
    days: [{ dayName: 'Lunes', exercises: [{ name: '', sets: '', reps: '', videoUrl: '' }] }]
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const alumnosRes = await axios.get("http://localhost:4000/api/auth/alumnos", { withCredentials: true });
        setAlumnos(alumnosRes.data);

        if (isEditing) {
          const routineRes = await axios.get(`http://localhost:4000/api/routines/${id}`, { withCredentials: true });
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
    newDays[activeDayIndex].exercises.push({ name: '', sets: '', reps: '', videoUrl: '' });
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

  const handleSaveRoutine = async () => {
    if (!routine.title) return showErrorToast("Por favor, ponle un título a la rutina");
    if (!routine.studentId) return showErrorToast("Por favor, selecciona un alumno");

    const url = isEditing ? `http://localhost:4000/api/routines/${id}` : "http://localhost:4000/api/routines/create";
    const method = isEditing ? "PUT" : "POST";

    try {
      // Usar axios para consistencia y manejo de withCredentials
      await axios({
        url,
        method,
        data: routine,
        withCredentials: true,
      });

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
        <button onClick={() => navigate(-1)} className="mb-6 text-sm font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-2">
          <span>←</span> Volver
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-8">{isEditing ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h1>
        
        {/* INFO GENERAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <select value={routine.studentId} onChange={(e) => setRoutine({...routine, studentId: e.target.value})} className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Seleccionar alumno...</option>
            {alumnos.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <input className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Título de la rutina (Ej: Semana 1 - Pecho)" value={routine.title} onChange={(e) => setRoutine({...routine, title: e.target.value})} />
          <select value={routine.level} onChange={(e) => setRoutine({...routine, level: e.target.value})} className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
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
            <div key={eIndex} className="bg-zinc-800 p-4 mb-4 rounded-xl border border-zinc-700 relative">
              <button onClick={() => removeExercise(eIndex)} className="absolute top-3 right-3 text-red-500 hover:text-red-400 font-bold text-lg">✕</button>
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="Nombre del Ejercicio" value={ex.name} onChange={(e) => updateExercise(eIndex, 'name', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <input placeholder="Series" value={ex.sets} onChange={(e) => updateExercise(eIndex, 'sets', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <input placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(eIndex, 'reps', e.target.value)} className="p-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
          ))}
          <button onClick={addExercise} className="w-full py-4 border-2 border-dashed border-zinc-700 text-zinc-400 rounded-xl mt-4 hover:bg-zinc-800/50 hover:border-zinc-600 transition-colors">+ Agregar ejercicio</button>
        </div>

        <button onClick={handleSaveRoutine} className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-500 transition-colors">
          {isEditing ? 'Guardar Cambios' : 'Guardar Rutina'}
        </button>
      </div>
    </div>
  );
};

export default TeacherPanel;