import React, { useState, useEffect } from 'react';
import api from '../../service/api.js';
import { showErrorToast } from '../../utils/swal.js';

const getTodayLocal = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  return formatter.format(new Date());
};

const ProfessorDetail = ({ professor, onClose }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const endDate = getTodayLocal();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      const startDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(start);

      try {
        const res = await api.get('/api/attendance/gym/history', {
          params: { startDate, endDate },
        });
        setHistory(res.data);
      } catch {
        showErrorToast('Error al cargar historial');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const profHistory = history?.professors?.find(p => p._id === professor._id);

  const sortedDays = profHistory?.dailyCheckIns
    ? Object.entries(profHistory.dailyCheckIns).sort(([a], [b]) => b.localeCompare(a))
    : [];

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-zinc-200">{professor.name}</p>
          {profHistory && (
            <p className="text-xs text-zinc-500">
              {profHistory.totalDays} días • {profHistory.attendanceRate}% asistencia
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-lg">✕</button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500 text-center py-4">Cargando historial...</p>
      ) : sortedDays.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">Sin registros en los últimos 90 días.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="pb-2 text-zinc-300 font-medium text-xs">Fecha</th>
                <th className="pb-2 text-zinc-300 font-medium text-xs">Entrada</th>
                <th className="pb-2 text-zinc-300 font-medium text-xs">Salida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedDays.map(([date, day]) => (
                <tr key={date} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="py-2 text-zinc-100 text-xs font-medium">
                    {new Date(date + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                  </td>
                  <td className="py-2 text-xs">
                    {day.checkIn
                      ? new Date(day.checkIn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="py-2 text-xs">
                    {day.checkOut
                      ? new Date(day.checkOut).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                      : <span className="text-zinc-600">En curso</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AttendanceToday = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getTodayLocal());

  const fetchAttendance = async (date) => {
    setLoading(true);
    try {
      const params = date ? { date } : {};
      const res = await api.get('/api/attendance/gym', { params });
      setData(res.data);
    } catch {
      showErrorToast('Error al cargar asistencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(selectedDate); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAttendance(newDate);
    setExpandedId(null);
  };

  const filteredProfessors = data?.professors?.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.dni && p.dni.includes(term))
    );
  }) || [];

  const todayStr = getTodayLocal();
  const isToday = selectedDate === todayStr;

  const present = filteredProfessors.filter(p => p.checkedInToday);
  const absent = filteredProfessors.filter(p => !p.checkedInToday);

  const handleToggle = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading && !data) {
    return (
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm p-6">
        <p className="text-zinc-500 text-sm">Cargando asistencia...</p>
      </div>
    );
  }

  if (!data) return null;

  const dateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 pb-4 border-b border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-200">Asistencia de Profesores</h2>
            <p className="text-xs text-zinc-500 capitalize mt-0.5">{dateLabel}</p>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={handleDateChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {!isToday && (
          <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg">
            Mostrando asistencia del {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {data.professors?.length === 0 ? (
        <p className="p-6 text-center text-zinc-500 text-sm">No hay profesores registrados.</p>
      ) : filteredProfessors.length === 0 ? (
        <p className="p-6 text-center text-zinc-500 text-sm">Ningún profesor coincide con la búsqueda.</p>
      ) : (
        <div className="divide-y divide-zinc-800">
          {present.length > 0 && (
            <div className="px-6 py-3">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Presentes</p>
              {present.map(p => (
                <div key={p._id}>
                  <button
                    onClick={() => handleToggle(p._id)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-800/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-medium text-zinc-200 text-sm truncate">{p.name}</span>
                      {p.dni && <span className="text-[10px] text-zinc-600 shrink-0">DNI {p.dni}</span>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-emerald-400 font-semibold">
                        {p.lastCheckIn
                          ? new Date(p.lastCheckIn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                      {p.lastCheckOut && (
                        <span className="text-[10px] text-zinc-600">
                          salida {new Date(p.lastCheckOut).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <svg className={`w-4 h-4 text-zinc-600 transition-transform ${expandedId === p._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedId === p._id && (
                    <ProfessorDetail professor={p} onClose={() => setExpandedId(null)} />
                  )}
                </div>
              ))}
            </div>
          )}

          {absent.length > 0 && (
            <div className="px-6 py-3">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Ausentes</p>
              {absent.map(p => (
                <div key={p._id}>
                  <button
                    onClick={() => handleToggle(p._id)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-800/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                      <span className="font-medium text-zinc-400 text-sm truncate">{p.name}</span>
                      {p.dni && <span className="text-[10px] text-zinc-700 shrink-0">DNI {p.dni}</span>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-zinc-600">Ausente</span>
                      <svg className={`w-4 h-4 text-zinc-600 transition-transform ${expandedId === p._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedId === p._id && (
                    <ProfessorDetail professor={p} onClose={() => setExpandedId(null)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceToday;
