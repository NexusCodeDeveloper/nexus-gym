import { useState, useEffect } from 'react';
import api from '../../service/api.js';
import { showErrorToast } from '../../utils/swal';

const AR_TZ = 'America/Argentina/Buenos_Aires';

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const formatter = new Intl.DateTimeFormat('es-AR', {
    timeZone: AR_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(new Date(dateString));
};

const SecurityLog = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/api/security/alerts?all=1');
        setAlerts(res.data?.data || []);
      } catch {
        showErrorToast('Error al cargar el historial de seguridad');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Seguridad</h1>
        <p className="text-zinc-400 mt-1">
          Alertas de posibles capturas de pantalla de alumnos
        </p>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 border-b border-zinc-700 text-zinc-400 font-medium">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm">Alumno</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">DNI</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Fecha</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400">Cargando alertas...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400">No hay alertas registradas.</td></tr>
              ) : (
                alerts.map(alert => (
                  <tr key={alert._id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-zinc-100 text-sm sm:text-base">{alert.student?.name || 'Alumno eliminado'}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">{alert.student?.dni || '-'}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">{formatDateTime(alert.createdAt)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${
                        alert.readBy?.length > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {alert.readBy?.length > 0 ? 'Vista' : 'Sin leer'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityLog;