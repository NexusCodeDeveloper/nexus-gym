import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../service/api.js';
import { showWarningToast } from '../utils/swal';

const POLL_INTERVAL_MS = 20 * 1000;

const useSecurityAlerts = () => {
  const { user } = useAuth();
  const shownRef = useRef(new Set());

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'profesor')) return;

    let interval = null;

    const checkAlerts = async () => {
      try {
        const res = await api.get('/api/security/alerts');
        const alerts = res.data?.data || [];

        for (const alert of alerts) {
          if (shownRef.current.has(alert._id)) continue;

          try {
            await api.patch(`/api/security/alerts/${alert._id}/read`);
            shownRef.current.add(alert._id);

            const studentName = alert.student?.name || 'Un alumno';
            const studentDni = alert.student?.dni ? ` (DNI ${alert.student.dni})` : '';
            showWarningToast(`🔒 ${studentName}${studentDni} realizó una posible captura de pantalla`);
          } catch {
            // La alerta se reintenta en el próximo ciclo si falla el marcado
          }
        }
      } catch {
        // Sin conexión o sin sesión: se reintenta en el próximo ciclo
      }
    };

    checkAlerts();
    interval = setInterval(checkAlerts, POLL_INTERVAL_MS);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);
};

export default useSecurityAlerts;