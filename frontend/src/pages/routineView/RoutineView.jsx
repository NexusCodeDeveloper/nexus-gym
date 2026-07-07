import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoutineView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/routines/${id}`, {
          withCredentials: true
        });
        setRoutine(response.data);
      } catch (error) {
        console.error('Error al cargar la rutina', error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutine();
  }, [id, navigate]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/routine-progress/${id}`, {
          withCredentials: true
        });
        const progress = res.data;
        if (progress?.days?.length > 0) {
          const map = {};
          progress.days.forEach(d => {
            d.completedExercises.forEach(exIdx => {
              map[`${d.dayIndex}-${exIdx}`] = true;
            });
          });
          setCompletedExercises(map);
        }
      } catch (err) {
        // si no hay progreso aún, ignorar
      }
    };
    if (id) fetchProgress();
  }, [id]);

  const saveDayProgress = useCallback(async (dayIndex, exerciseMap) => {
    setSaving(true);
    try {
      const completedExercisesList = [];
      const dayExs = routine?.days?.[dayIndex]?.exercises || [];
      dayExs.forEach((_, i) => {
        if (exerciseMap[`${dayIndex}-${i}`]) completedExercisesList.push(i);
      });
      await axios.put(`http://localhost:4000/api/routine-progress/${id}/day`, {
        dayIndex,
        completedExercises: completedExercisesList
      }, { withCredentials: true });
    } catch (err) {
      console.error('Error al guardar progreso', err);
    } finally {
      setSaving(false);
    }
  }, [id, routine]);

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

  const currentDay = routine?.days?.[activeDayIndex];
  const totalExercises = currentDay?.exercises?.length || 0;
  const completedCount = currentDay?.exercises?.filter((_, i) => completedExercises[`${activeDayIndex}-${i}`]).length || 0;
  const progress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const allDone = totalExercises > 0 && completedCount === totalExercises;

  const toggleExercise = (dayIdx, exIdx) => {
    const key = `${dayIdx}-${exIdx}`;
    setCompletedExercises(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const dayExs = routine?.days?.[dayIdx]?.exercises || [];
      const allCompleted = dayExs.every((_, i) => next[`${dayIdx}-${i}`]);
      if (allCompleted && dayIdx === activeDayIndex) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      saveDayProgress(dayIdx, next);
      return next;
    });
  };

  const isDayComplete = (dayIdx) => {
    const exs = routine?.days?.[dayIdx]?.exercises || [];
    return exs.length > 0 && exs.every((_, i) => completedExercises[`${dayIdx}-${i}`]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Preparando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (!routine) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
              <span>←</span> Volver al inicio
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{routine.title}</h1>
                <p className="text-zinc-500 text-sm font-medium capitalize">{today}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                routine.level === 'Principiante' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                routine.level === 'Intermedio' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {routine.level}
              </span>
            </div>
          </div>
        </div>

        {/* DAY SELECTOR + PROGRESS */}
        {routine.days?.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Días de entrenamiento</h2>
              {totalExercises > 0 && (
                <span className="text-xs font-semibold text-zinc-500">{completedCount}/{totalExercises} ejercicios</span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {routine.days.map((day, index) => {
                const complete = isDayComplete(index);
                const isActive = index === activeDayIndex;
                return (
                  <button
                    key={index}
                    onClick={() => { setActiveDayIndex(index); setShowCelebration(false); }}
                    className={`
                      flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border
                      ${isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : complete
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'}
                    `}
                  >
                    {complete && <span className="text-xs">✔</span>}
                    {day.dayName}
                  </button>
                );
              })}
            </div>

            {/* PROGRESS BAR */}
            {totalExercises > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Progreso del día</span>
                  <span className="font-bold text-zinc-300">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CELEBRATION */}
        {showCelebration && allDone && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-pulse">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-emerald-400 font-bold text-lg">¡Día completado!</p>
            <p className="text-emerald-400/70 text-sm mt-1">Excelente trabajo, {routine.days?.[activeDayIndex]?.dayName} está listo.</p>
          </div>
        )}

        {/* EXERCISE LIST */}
        {currentDay?.exercises?.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>{routine.days?.[activeDayIndex]?.dayName}</span>
              <span className="text-sm font-normal text-zinc-500">— {totalExercises} ejercicios</span>
            </h3>

            {currentDay.exercises.map((ex, idx) => {
              const isDone = completedExercises[`${activeDayIndex}-${idx}`];
              return (
                <div
                  key={idx}
                  className={`
                    rounded-2xl border transition-all duration-300 overflow-hidden
                    ${isDone
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
                  `}
                >
                  {ex.videoUrl && (
                    <div className="relative bg-zinc-800">
                      <video
                        src={ex.videoUrl}
                        className="w-full max-h-64 object-contain"
                        controls
                        preload="metadata"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-xl text-sm font-bold shrink-0 transition-colors
                          ${isDone ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300'}
                        `}>
                          {isDone ? '✔' : idx + 1}
                        </div>
                        <h4 className={`text-lg font-bold truncate ${isDone ? 'text-emerald-300' : 'text-zinc-100'}`}>
                          {ex.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                        <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-8">
                        <div className="text-center">
                          <span className="block text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Series</span>
                          <span className={`text-lg sm:text-2xl font-black ${isDone ? 'text-emerald-300' : 'text-zinc-100'}`}>
                            {ex.sets || '-'}
                          </span>
                        </div>
                        <div className="w-px h-6 sm:h-8 bg-zinc-700" />
                        <div className="text-center">
                          <span className="block text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reps</span>
                          <span className={`text-lg sm:text-2xl font-black ${isDone ? 'text-emerald-300' : 'text-zinc-100'}`}>
                            {ex.reps || '-'}
                          </span>
                        </div>
                        <div className="w-px h-6 sm:h-8 bg-zinc-700" />
                        <div className="text-center">
                          <span className="block text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Descanso</span>
                          <span className={`text-lg sm:text-2xl font-black ${isDone ? 'text-emerald-300' : 'text-zinc-100'}`}>
                            {ex.rest || '-'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExercise(activeDayIndex, idx)}
                        disabled={saving}
                        className={`
                          w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200
                          ${isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'}
                          ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {isDone ? '✔ Completado' : 'Marcar hecho'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 p-12 text-center rounded-2xl">
            <p className="text-4xl mb-3">🏋️</p>
            <h3 className="text-xl font-bold text-zinc-300 mb-1">Día de descanso</h3>
            <p className="text-zinc-500 text-sm">No hay ejercicios para este día. Aprovechá para recuperarte.</p>
          </div>
        )}

        {/* SUMMARY FOOTER */}
        {routine.days?.length > 0 && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">Días completados:</span>
              <div className="flex gap-1.5">
                {routine.days.map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-colors ${isDayComplete(i) ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                ))}
              </div>
              <span className="text-zinc-400 font-semibold">{routine.days.filter((_, i) => isDayComplete(i)).length}/{routine.days.length}</span>
            </div>
            {allDone && <span className="text-emerald-400 font-bold text-xs">🔥 Día completo</span>}
          </div>
        )}

      </div>
    </div>
  );
};

export default RoutineView;
