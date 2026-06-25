import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext'; 

const StudentProfile = ({ user }) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Extraer el último dato del historial para mostrar en los inputs
  const latestWeight = user?.metrics?.weightHistory?.length > 0 
    ? user.metrics.weightHistory[user.metrics.weightHistory.length - 1].weight 
    : 0;
    
  const latestPrs = user?.metrics?.prsHistory?.length > 0 
    ? user.metrics.prsHistory[user.metrics.prsHistory.length - 1] 
    : { squat: 0, benchPress: 0, deadlift: 0 };

  const [metrics, setMetrics] = useState({
    weight: latestWeight,
    height: user?.metrics?.height || 0,
    prs: {
      squat: latestPrs.squat || 0,
      benchPress: latestPrs.benchPress || 0,
      deadlift: latestPrs.deadlift || 0
    }
  });

  const imc = metrics.height > 0 ? (metrics.weight / Math.pow(metrics.height / 100, 2)).toFixed(1) : 0;
  const imcStatus = imc < 18.5 ? "Bajo peso" : imc < 25 ? "Normal" : imc < 30 ? "Sobrepeso" : "Obesidad";

  // Formatear los datos para el gráfico de Recharts
  const chartData = user?.metrics?.weightHistory?.map(entry => ({
    fecha: new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    peso: entry.weight
  })) || [];

  // Formatear fecha de caducidad
  const expirationDate = user?.licenseEndDate ? new Date(user.licenseEndDate).toISOString().split('T')[0] : "No definida";

  const handleSave = async () => {
    try {
      const response = await axios.put("http://localhost:4000/api/profile/metrics", metrics, { withCredentials: true });
      
      // Actualizamos el contexto global con la respuesta firme del backend
      updateUser(response.data);
      
      setIsEditing(false);
      alert("¡Medidas guardadas con éxito!");
    } catch (error) {
      console.error(error);
      alert("Error al guardar las medidas");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ALERTA DE CADUCIDAD */}
      <div className="bg-zinc-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
        <span className="font-bold text-sm uppercase tracking-wider text-zinc-300">Vencimiento del Plan</span>
        <span className="font-black text-xl">{expirationDate}</span>
      </div>

      <header className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-zinc-200 text-zinc-800 rounded-full flex items-center justify-center text-3xl font-black">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-900">{user.name}</h1>
          <p className="text-zinc-500 font-medium capitalize">DNI: {user.dni || "No registrado"} • {user.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PANEL DE DATOS BIOMÉTRICOS */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-800">Mediciones</h2>
            {!isEditing && <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-blue-600 hover:text-blue-800">Actualizar Datos</button>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-2xl border text-center">
              <span className="block text-xs font-bold text-zinc-400 uppercase mb-1">Peso (kg)</span>
              {isEditing ? (
                <input type="number" className="w-full text-center text-xl font-bold bg-white border rounded-lg p-1" value={metrics.weight} onChange={(e) => setMetrics({...metrics, weight: Number(e.target.value)})} />
              ) : (
                <span className="text-2xl font-black text-zinc-900">{metrics.weight}</span>
              )}
            </div>
            
            <div className="bg-zinc-50 p-4 rounded-2xl border text-center">
              <span className="block text-xs font-bold text-zinc-400 uppercase mb-1">Altura (cm)</span>
              {isEditing ? (
                <input type="number" className="w-full text-center text-xl font-bold bg-white border rounded-lg p-1" value={metrics.height} onChange={(e) => setMetrics({...metrics, height: Number(e.target.value)})} />
              ) : (
                <span className="text-2xl font-black text-zinc-900">{metrics.height}</span>
              )}
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border text-center col-span-2">
              <span className="block text-xs font-bold text-zinc-400 uppercase mb-1">IMC Actual</span>
              <span className="text-2xl font-black text-zinc-900">{imc} <span className="text-sm text-zinc-500 font-medium">({imcStatus})</span></span>
            </div>
          </div>
        </div>

        {/* PANEL DE PRs */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-800 mb-6">Récords Personales (PR)</h2>
          <div className="space-y-3">
            {['squat', 'benchPress', 'deadlift'].map((lift) => (
              <div key={lift} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-700 capitalize">{lift === 'squat' ? 'Sentadilla' : lift === 'benchPress' ? 'Press Banca' : 'Peso Muerto'}</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-20 text-right font-bold border rounded-lg p-1" value={metrics.prs[lift]} onChange={(e) => setMetrics({...metrics, prs: {...metrics.prs, [lift]: Number(e.target.value)}})} />
                    <span className="text-sm text-zinc-500">kg</span>
                  </div>
                ) : (
                  <span className="font-black text-zinc-900">{metrics.prs[lift]} kg</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <button onClick={handleSave} className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl text-lg hover:bg-zinc-800 transition-colors">
          Guardar Nuevo Registro
        </button>
      )}

      {/* GRÁFICO HISTÓRICO RECHARTS */}
      {!isEditing && chartData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-800 mb-6">Evolución de Peso Corporal</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="peso" stroke="#18181b" strokeWidth={3} dot={{ fill: '#18181b', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;  