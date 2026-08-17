import React from 'react';

const AttendanceBar = ({ rate }) => {
  const color = rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-medium text-zinc-400">{rate}%</span>
    </div>
  );
};

const AttendanceTable = ({ data, loading, emptyMessage = 'No hay registros de asistencia en este período.' }) => {
  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center text-zinc-400">
        Cargando asistencia...
      </div>
    );
  }

  if (!data || !data.professors || data.professors.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center text-zinc-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
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
            {data.professors.map(prof => {
              const sortedDates = Object.keys(prof.dailyCheckIns).sort().reverse();
              return (
                <tr key={prof._id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {prof.name}
                      {!prof.isActive && (
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Inactivo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{prof.totalDays} / {data.totalDays}</td>
                  <td className="px-4 py-3">
                    <AttendanceBar rate={prof.attendanceRate} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {prof.lastCheckIn
                      ? new Date(prof.lastCheckIn).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {sortedDates.slice(0, 15).map(date => {
                        const day = prof.dailyCheckIns[date];
                        return (
                          <span
                            key={date}
                            className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded"
                            title={
                              day?.checkIn
                                ? `Entrada: ${new Date(day.checkIn).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}${day?.checkOut ? `\nSalida: ${new Date(day.checkOut).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}` : ''}`
                                : ''
                            }
                          >
                            {date.slice(5)}
                          </span>
                        );
                      })}
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
    </div>
  );
};

export default AttendanceTable;
