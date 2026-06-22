import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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
    if (!routine.title) return alert("Por favor, ponle un título a la rutina");
    if (!routine.studentId) return alert("Por favor, selecciona a qué alumno le vas a asignar la rutina");

    const url = isEditing ? `http://localhost:4000/api/routines/${id}` : "http://localhost:4000/api/routines/create";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routine),
        credentials: "include"
      });

      if (response.ok) {
        alert(isEditing ? "¡Rutina actualizada!" : "¡Rutina guardada!");
        navigate(-1);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-sm text-zinc-500">← Volver</button>
        <h1 className="text-3xl font-bold mb-8">{isEditing ? 'Editar Rutina' : 'Editor de Rutinas'}</h1>
        
        {/* INFO GENERAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-2xl border">
          <select value={routine.studentId} onChange={(e) => setRoutine({...routine, studentId: e.target.value})} className="p-3 border rounded-xl">
            <option value="">Seleccionar alumno...</option>
            {alumnos.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <input className="p-3 border rounded-xl" placeholder="Título" value={routine.title} onChange={(e) => setRoutine({...routine, title: e.target.value})} />
          <select value={routine.level} onChange={(e) => setRoutine({...routine, level: e.target.value})} className="p-3 border rounded-xl">
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>

        {/* NAVBAR DÍAS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {routine.days.map((day, index) => (
            <button key={index} onClick={() => setActiveDayIndex(index)} className={`px-5 py-2.5 rounded-xl font-bold ${activeDayIndex === index ? 'bg-zinc-900 text-white' : 'bg-white border'}`}>
              {day.dayName}
              <span className="ml-2" onClick={(e) => { e.stopPropagation(); removeDay(index); }}>✕</span>
            </button>
          ))}
          {routine.days.length < 7 && <button onClick={addDay} className="px-5 py-2.5 bg-zinc-200 rounded-xl font-bold">+</button>}
        </div>

        {/* LISTA EJERCICIOS */}
        <div className="bg-white p-6 rounded-2xl border">
          {routine.days[activeDayIndex]?.exercises.map((ex, eIndex) => (
            <div key={eIndex} className="bg-zinc-50 p-4 mb-4 rounded-xl border relative">
              <button onClick={() => removeExercise(eIndex)} className="absolute top-2 right-2 text-red-500">✕</button>
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="Nombre" value={ex.name} onChange={(e) => updateExercise(eIndex, 'name', e.target.value)} className="p-2 rounded" />
                <input placeholder="Series" value={ex.sets} onChange={(e) => updateExercise(eIndex, 'sets', e.target.value)} className="p-2 rounded" />
                <input placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(eIndex, 'reps', e.target.value)} className="p-2 rounded" />
              </div>
            </div>
          ))}
          <button onClick={addExercise} className="w-full py-4 border-2 border-dashed rounded-xl mt-4">+ Agregar ejercicio</button>
        </div>

        <button onClick={handleSaveRoutine} className="w-full mt-8 bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg">
          {isEditing ? 'Guardar Cambios' : 'Guardar Rutina'}
        </button>
      </div>
    </div>
  );
};

export default TeacherPanel;