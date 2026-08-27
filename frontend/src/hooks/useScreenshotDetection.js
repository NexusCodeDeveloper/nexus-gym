import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../service/api.js';
import { showWarningToast } from '../utils/swal';

const MIN_REPORT_INTERVAL_MS = 5 * 60 * 1000;

const useScreenshotDetection = () => {
  const { user } = useAuth();
  const hiddenAtRef = useRef(null);
  const lastReportRef = useRef(0);

  const report = useCallback(async () => {
    const now = Date.now();
    if (now - lastReportRef.current < MIN_REPORT_INTERVAL_MS) return;
    lastReportRef.current = now;

    try {
      await api.post('/api/security/screenshot-log');
      showWarningToast('Se registró una posible captura de pantalla. La acción quedó notificada a tu gimnasio.');
    } catch {
      // La alerta ya pudo ser registrada recientemente o hubo un error de red
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'alumno') return;

    const checkReturn = () => {
      if (!hiddenAtRef.current) return;
      const awayMs = Date.now() - hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (awayMs > 0) report();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else {
        checkReturn();
      }
    };

    const onBlur = () => {
      hiddenAtRef.current = Date.now();
    };

    const onFocus = () => {
      checkReturn();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [user?.role, report]);
};

export default useScreenshotDetection;