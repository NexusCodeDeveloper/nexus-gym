import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffProfile = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/profile/stats", { withCredentials: true });
        setStats(response.data);
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <header className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-900">{user.name}</h1>
          <p className="text-zinc-500 font-medium capitalize">{user.role} del Gimnasio • {user.email}</p>
        </div>
      </header>

      {loading || !stats ? (
        <div className="bg-white p-12 rounded-3xl border border-zinc-200 shadow-sm text-center">
          <p className="text-zinc-500 font-medium">Cargando métricas del gimnasio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PANEL DE ALUMNOS */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl">👥</span>
              <h3 className="text-xl font-bold text-zinc-800">Gestión de Alumnos</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-green-600 uppercase">Activos</span>
                <span className="text-4xl font-black text-green-700">{stats.activeStudents}</span>
              </div>
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-red-600 uppercase">Inactivos</span>
                <span className="text-4xl font-black text-red-700">{stats.inactiveStudents}</span>
              </div>
            </div>
          </div>

          {/* PANEL DE PROFESORES */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl">👨‍🏫</span>
              <h3 className="text-xl font-bold text-zinc-800">Gestión de Profesores</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-blue-600 uppercase">Activos</span>
                <span className="text-4xl font-black text-blue-700">{stats.activeTeachers}</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-center">
                <span className="block text-sm font-bold text-zinc-500 uppercase">Inactivos</span>
                <span className="text-4xl font-black text-zinc-700">{stats.inactiveTeachers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm md:col-span-2 flex justify-around items-center">
            <div className="text-center">
              <span className="block text-sm font-bold text-zinc-500 uppercase">Rutinas Creadas</span>
              <span className="text-4xl font-black text-zinc-900">{stats.totalRoutines}</span>
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-zinc-500 uppercase">Tasa de Asistencia</span>
              <span className="text-4xl font-black text-zinc-900">{stats.attendanceRate}%</span>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default StaffProfile;