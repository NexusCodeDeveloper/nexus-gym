import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../../utils/swal';
import AttendanceCheckin from '../../components/attendance/AttendanceCheckin';
import api from '../../service/api.js';

const StudentProfile = ({ user }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const currentWeight = user?.metrics?.weightHistory?.length > 0
    ? user.metrics.weightHistory[user.metrics.weightHistory.length - 1].weight
    : 0;
  const currentHeight = user?.metrics?.height || 0;
  const currentPrs = user?.metrics?.prsHistory?.length > 0
    ? user.metrics.prsHistory[user.metrics.prsHistory.length - 1]
    : { squat: 0, benchPress: 0, deadlift: 0 };

  const [workoutHistory, setWorkoutHistory] = useState([]);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const res = await api.get('/api/workout/history');
        setWorkoutHistory(res.data.data || []);
      } catch { /* ignore */ }
    };
    fetchWorkoutHistory();
  }, []);

  const [metrics, setMetrics] = useState({
    weight: currentWeight,
    height: currentHeight,
    prs: {
      squat: currentPrs.squat || 0,
      benchPress: currentPrs.benchPress || 0,
      deadlift: currentPrs.deadlift || 0
    }
  });

  const imc = currentHeight > 0 ? (currentWeight / Math.pow(currentHeight / 100, 2)).toFixed(1) : 0;

  const chartData = useMemo(() => {
    const history = user?.metrics?.weightHistory;
    if (!history || history.length === 0) return [];
    return history.map(entry => ({
      fecha: entry.date ? new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '',
      peso: entry.weight
    }));
  }, [user?.metrics?.weightHistory]);

  const expirationDate = user?.licenseEndDate ? new Date(user.licenseEndDate).toISOString().split('T')[0] : "No definida";

  const handleSave = async () => {
    try {
      const response = await api.put("/api/profile/metrics", metrics);

      updateUser(response.data);

      const saved = response.data;
      const lastWeight = saved?.metrics?.weightHistory?.length > 0
        ? saved.metrics.weightHistory[saved.metrics.weightHistory.length - 1].weight
        : 0;
      const lastPrs = saved?.metrics?.prsHistory?.length > 0
        ? saved.metrics.prsHistory[saved.metrics.prsHistory.length - 1]
        : { squat: 0, benchPress: 0, deadlift: 0 };
      setMetrics({
        weight: lastWeight,
        height: saved?.metrics?.height || 0,
        prs: {
          squat: lastPrs.squat || 0,
          benchPress: lastPrs.benchPress || 0,
          deadlift: lastPrs.deadlift || 0
        }
      });

      setIsEditing(false);
      showSuccessToast("¡Medidas guardadas con éxito!");
    } catch (error) {
      console.error(error);
      showErrorToast("Error al guardar las medidas");
    }
  };

  return (
    <div className="space-y-6">

      <AttendanceCheckin />

      {/* ALERTA DE CADUCIDAD */}
      <div className="bg-zinc-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
        <span className="font-bold text-sm uppercase tracking-wider text-zinc-300">Vencimiento del Plan</span>
        <span className="font-black text-xl">{expirationDate}</span>
      </div>

      <header className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-3xl font-black">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-100">{user.name}</h1>
          <p className="text-zinc-400 font-medium capitalize">DNI: {user.dni || "No registrado"}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-200">Mediciones</h2>
            {!isEditing && <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-blue-500 hover:text-blue-400">Actualizar Datos</button>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 text-center">
              <span className="block text-xs font-bold text-zinc-500 uppercase mb-1">Peso (kg)</span>
              {isEditing ? (
                <input type="number" className="w-full text-center text-xl font-bold bg-zinc-700 border border-zinc-600 rounded-lg p-1 text-zinc-100" value={metrics.weight} onChange={(e) => setMetrics({...metrics, weight: Number(e.target.value)})} />
              ) : (
                <span className="text-2xl font-black text-zinc-100">{currentWeight || '—'}</span>
              )}
            </div>

            <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 text-center">
              <span className="block text-xs font-bold text-zinc-500 uppercase mb-1">Altura (cm)</span>
              {isEditing ? (
                <input type="number" className="w-full text-center text-xl font-bold bg-zinc-700 border border-zinc-600 rounded-lg p-1 text-zinc-100" value={metrics.height} onChange={(e) => setMetrics({...metrics, height: Number(e.target.value)})} />
              ) : (
                <span className="text-2xl font-black text-zinc-100">{currentHeight || '—'}</span>
              )}
            </div>

            <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 text-center col-span-2">
              <span className="block text-xs font-bold text-zinc-500 uppercase mb-1">IMC Actual</span>
              <span className="text-2xl font-black text-zinc-100">{imc} </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-200 mb-6">Récords Personales (PR)</h2>
          <div className="space-y-3">
            {['squat', 'benchPress', 'deadlift'].map((lift) => (
              <div key={lift} className="flex justify-between items-center p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                <span className="font-bold text-zinc-300 capitalize">{lift === 'squat' ? 'Sentadilla' : lift === 'benchPress' ? 'Press Banca' : 'Peso Muerto'}</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-20 text-right font-bold bg-zinc-700 border border-zinc-600 rounded-lg p-1 text-zinc-100" value={metrics.prs[lift]} onChange={(e) => setMetrics({...metrics, prs: {...metrics.prs, [lift]: Number(e.target.value)}})} />
                    <span className="text-sm text-zinc-400">kg</span>
                  </div>
                ) : (
                  <span className="font-black text-zinc-100">{(currentPrs[lift] || 0)} kg</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-lg hover:bg-blue-500 transition-colors">
          Guardar Nuevo Registro
        </button>
      )}

      {!isEditing && (
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-200 mb-6">Evolución de Peso Corporal</h2>
          {chartData.length > 0 ? (
            <div className="h-64 w-full" key={chartData.length}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                  <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #3f3f46', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#18181b' }}
                    itemStyle={{ color: '#fafafa', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="peso" stroke="#fafafa" strokeWidth={3} dot={{ fill: '#fafafa', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-10">Aún no hay registros de peso. Guardá tu primer registro para ver la evolución.</p>
          )}
        </div>
      )}

      <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🏋️</span>
          <h2 className="text-xl font-bold text-zinc-200">Historial de Entrenamientos</h2>
        </div>
        {workoutHistory.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">Aún no tenés entrenamientos registrados. Iniciá uno desde tu rutina.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-800/50 border-b border-zinc-700">
                <tr>
                  <th className="px-3 py-3 text-zinc-300 font-medium text-xs">Fecha</th>
                  <th className="px-3 py-3 text-zinc-300 font-medium text-xs">Hora</th>
                  <th className="px-3 py-3 text-zinc-300 font-medium text-xs">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {workoutHistory.map(session => (
                  <tr key={session._id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-3 py-3 text-zinc-100 text-xs font-medium whitespace-nowrap">
                      {new Date(session.startTime).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-400 whitespace-nowrap">
                      {new Date(session.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {session.duration >= 60
                          ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
                          : `${session.duration} min`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
