import React, { useState, useEffect } from 'react';
import api from '../../service/api.js';
import AttendanceCheckin from '../../components/attendance/AttendanceCheckin';
import AttendanceToday from '../../components/attendance/AttendanceToday';

const StaffProfile = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/profile/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Error cargando estadísticas", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-100">{user.name}</h1>
          <p className="text-zinc-400 font-medium capitalize">{user.role} del Gimnasio • {user.email}</p>
        </div>
      </header>

      {user.role === 'profesor' && <AttendanceCheckin />}

      {loading || !stats ? (
        <div className="bg-zinc-900 p-12 rounded-3xl border border-zinc-800 shadow-sm text-center">
          <p className="text-zinc-400 font-medium">Cargando métricas del gimnasio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl">👥</span>
              <h3 className="text-xl font-bold text-zinc-200">Gestión de Alumnos</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-green-400 uppercase">Activos</span>
                <span className="text-4xl font-black text-green-300">{stats.activeStudents}</span>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-red-400 uppercase">Inactivos</span>
                <span className="text-4xl font-black text-red-300">{stats.inactiveStudents}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl">👨‍🏫</span>
              <h3 className="text-xl font-bold text-zinc-200">Gestión de Profesores</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-blue-400 uppercase">Activos</span>
                <span className="text-4xl font-black text-blue-300">{stats.activeTeachers}</span>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-zinc-400 uppercase">Inactivos</span>
                <span className="text-4xl font-black text-zinc-300">{stats.inactiveTeachers}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm md:col-span-2 flex justify-around items-center">
            <div className="text-center">
              <span className="block text-sm font-bold text-zinc-400 uppercase">Rutinas Creadas</span>
              <span className="text-4xl font-black text-zinc-100">{stats.totalRoutines}</span>
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-zinc-400 uppercase">Tasa de Asistencia</span>
              <span className="text-4xl font-black text-zinc-100">{stats.attendanceRate}%</span>
            </div>
          </div>

        </div>
      )}

      {user.role === 'admin' && <AttendanceToday />}
    </div>
  );
};

export default StaffProfile;
