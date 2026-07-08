import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffProfile = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const today = new Date().toISOString().split('T')[0];

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

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const res = await axios.get('http://localhost:4000/api/attendance/gym/history', {
        params: { startDate: dateRange.from, endDate: dateRange.to },
        withCredentials: true,
      });
      setAttendanceData(res.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

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

      {loading || !stats ? (
        <div className="bg-zinc-900 p-12 rounded-3xl border border-zinc-800 shadow-sm text-center">
          <p className="text-zinc-400 font-medium">Cargando métricas del gimnasio...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PANEL DE ALUMNOS */}
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

          {/* PANEL DE PROFESORES */}
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

      {/* HISTORIAL DE ASISTENCIA */}
      {user.role === 'admin' && (
        <section className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm p-6">
          <h2 className="text-xl font-bold text-zinc-200 mb-4">Historial de Asistencia</h2>

          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Desde</label>
              <input
                type="date"
                value={dateRange.from}
                max={dateRange.to || today}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full sm:w-auto px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Hasta</label>
              <input
                type="date"
                value={dateRange.to}
                max={today}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full sm:w-auto px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAttendance}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>

          {attendanceLoading ? (
            <div className="p-8 text-center text-zinc-400">Cargando asistencia...</div>
          ) : attendanceData && attendanceData.professors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-800/50 border-b border-zinc-700">
                  <tr>
                    <th className="px-4 py-3 text-zinc-300 font-medium">Profesor</th>
                    <th className="px-4 py-3 text-zinc-300 font-medium">Días</th>
                    <th className="px-4 py-3 text-zinc-300 font-medium">Asistencia</th>
                    <th className="px-4 py-3 text-zinc-300 font-medium">Último Check-in</th>
                    <th className="px-4 py-3 text-zinc-300 font-medium">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {attendanceData.professors.map(prof => {
                    const sortedDates = Object.keys(prof.dailyCheckIns).sort().reverse();
                    return (
                      <tr key={prof._id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-100 whitespace-nowrap">{prof.name}</td>
                        <td className="px-4 py-3">{prof.totalDays} / {attendanceData.totalDays}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  prof.attendanceRate >= 70 ? 'bg-green-500' : prof.attendanceRate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${prof.attendanceRate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-zinc-400">{prof.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">
                          {prof.lastCheckIn ? new Date(prof.lastCheckIn).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {sortedDates.slice(0, 15).map(date => (
                              <span
                                key={date}
                                className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded"
                                title={new Date(prof.dailyCheckIns[date]).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                              >
                                {date.slice(5)}
                              </span>
                            ))}
                            {sortedDates.length > 15 && (
                              <span className="text-xs text-zinc-500">+{sortedDates.length - 15} más</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : attendanceData ? (
            <div className="p-8 text-center text-zinc-400">No hay registros de asistencia en este período.</div>
          ) : null}
        </section>
      )}
    </div>
  );
};

export default StaffProfile;