import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TeacherPanel = () => {
  const navigate = useNavigate();
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  
  // 1. Estado para guardar la lista de alumnos traídos del backend
  const [alumnos, setAlumnos] = useState([]);
  
  const [routine, setRoutine] = useState({
    title: '',
    level: 'Principiante',
    studentId: '', // 2. Agregamos el campo studentId vacío por defecto
    days: [{ dayName: 'Lunes', exercises: [{ name: '', sets: '', reps: '', videoUrl: '' }] }]
  });

  // 3. Traemos a los alumnos apenas carga la pantalla
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/auth/alumnos", {
          withCredentials: true // Clave para que valide el token
        });
        setAlumnos(response.data);
      } catch (error) {
        console.error("Error al cargar los alumnos", error);
      }
    };
    fetchAlumnos();
  }, []);

  const addDay = () => {
    if (routine.days.length >= 7) return;
    const newDay = { dayName: DIAS_SEMANA[routine.days.length], exercises: [] };
    setRoutine({ ...routine, days: [...routine.days, newDay] });
  };

  const removeDay = (index) => {
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
    // 4. Validación para que no te olvides de asignarla
    if (!routine.studentId) return alert("Por favor, selecciona a qué alumno le vas a asignar la rutina");

    try {
      const response = await fetch("http://localhost:4000/api/routines/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routine),
        credentials: "include" 
      });

      if (response.ok) {
        alert("¡Rutina guardada y asignada exitosamente!");
        navigate(-1); 
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error conectando con el servidor:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <span>←</span> Volver a mis rutinas
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Editor de Rutinas</h1>
          <p className="text-zinc-500">Crea y asigna el plan de entrenamiento a un alumno</p>
        </header>

        {/* INFO GENERAL DE LA RUTINA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Asignar a Alumno</label>
            <select 
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:bg-white transition-colors"
              value={routine.studentId}
              onChange={(e) => setRoutine({...routine, studentId: e.target.value})}
            >
              <option value="">Seleccionar alumno...</option>
              {alumnos.map(alumno => (
                <option key={alumno._id} value={alumno._id}>
                  {alumno.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nombre de la rutina</label>
            <input 
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:bg-white transition-colors" 
              placeholder="Ej: Hipertrofia 4 Días" 
              value={routine.title}
              onChange={(e) => setRoutine({...routine, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nivel</label>
            <select 
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 focus:bg-white transition-colors"
              value={routine.level}
              onChange={(e) => setRoutine({...routine, level: e.target.value})}
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        {/* NAVBAR DE DÍAS INTEGRADO */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {routine.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDayIndex(index)}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                activeDayIndex === index 
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {day.dayName}
              
              {routine.days.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); removeDay(index); }}
                  className={`flex items-center justify-center w-5 h-5 rounded-full transition-opacity 
                    ${activeDayIndex === index ? 'text-white/70 hover:text-white' : 'text-zinc-400 hover:text-red-500'}
                    md:opacity-0 md:group-hover:opacity-100`}
                >
                  ✕
                </span>
              )}
            </button>
          ))}
          
          {routine.days.length < 7 && (
            <button 
              onClick={addDay} 
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors"
            >
              +
            </button>
          )}
        </div>

        {/* EDITOR DEL DÍA ACTIVO */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <h2 className="text-xl font-bold text-zinc-800">
              Ejercicios para el {routine.days[activeDayIndex].dayName}
            </h2>
            <select 
              className="text-sm border-none bg-zinc-100 text-zinc-700 font-medium rounded-lg p-2 outline-none cursor-pointer"
              value={routine.days[activeDayIndex].dayName}
              onChange={(e) => {
                const newDays = [...routine.days];
                newDays[activeDayIndex].dayName = e.target.value;
                setRoutine({...routine, days: newDays});
              }}
            >
              {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* LISTA DE EJERCICIOS CON NUEVO DISEÑO */}
          <div className="space-y-6">
            {routine.days[activeDayIndex].exercises.map((ex, eIndex) => (
              <div key={eIndex} className="relative bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                
                <button 
                  onClick={() => removeExercise(eIndex)} 
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
                  title="Eliminar ejercicio"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Nombre del Ejercicio</label>
                    <input 
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 text-sm" 
                      placeholder="Ej: Sentadilla Libre" 
                      value={ex.name}
                      onChange={(e) => updateExercise(eIndex, 'name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Series</label>
                      <input 
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 text-sm" 
                        placeholder="Ej: 4" 
                        value={ex.sets}
                        onChange={(e) => updateExercise(eIndex, 'sets', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Repeticiones</label>
                      <input 
                        className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 text-sm" 
                        placeholder="Ej: 10-12" 
                        value={ex.reps}
                        onChange={(e) => updateExercise(eIndex, 'reps', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Enlace de Video (Opcional)</label>
                  <input 
                    className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl outline-none focus:border-zinc-500 text-sm text-blue-600" 
                    placeholder="https://youtube.com/..." 
                    value={ex.videoUrl || ''}
                    onChange={(e) => updateExercise(eIndex, 'videoUrl', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={addExercise} className="mt-6 w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-sm font-bold text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 transition-all">
            + Agregar otro ejercicio a este día
          </button>
        </div>

        {/* BOTÓN DE GUARDADO */}
        <button 
          onClick={handleSaveRoutine}
          className="mt-8 w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          Guardar y Asignar Rutina
        </button>
      </div>
    </div>
  );
};

export default TeacherPanel;