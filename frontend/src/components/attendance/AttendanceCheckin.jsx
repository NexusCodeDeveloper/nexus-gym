import React, { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../../utils/swal';
import api from '../../service/api.js';

const AttendanceCheckin = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/api/attendance/my');
      setAttendance(res.data);
    } catch {
      showErrorToast('Error al cargar datos de asistencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const handleCheckin = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/attendance/checkin', {});
      await fetchAttendance();
      showSuccessToast('Asistencia marcada correctamente');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Error al marcar asistencia');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    const confirmed = await showConfirmDialog({
      title: '¿Marcar salida?',
      text: 'Confirmás que querés registrar tu salida del día de hoy.',
      confirmButtonText: 'Sí, marcar salida',
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await api.post('/api/attendance/checkout', {});
      await fetchAttendance();
      showSuccessToast('Salida marcada correctamente');
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Error al marcar salida');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = attendance?.checkedInToday
    ? attendance?.hasCheckedOut
      ? '\u2705'
      : '\u23F3'
    : '\uD83D\uDCC5';

  return (
    <div className="bg-zinc-900 px-5 py-3 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0">{loading ? '\u23F3' : statusIcon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-200 truncate">
            {loading ? 'Cargando...' : attendance?.checkedInToday ? 'Asistencia registrada hoy' : 'No marcaste asistencia hoy'}
          </p>
          <p className="text-[11px] text-zinc-500">
            {loading ? '' : attendance?.checkedInToday && !attendance?.hasCheckedOut ? 'No registraste salida aún' : ''}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {loading ? (
          <div className="w-20 h-8 bg-zinc-800 rounded-xl animate-pulse" />
        ) : attendance?.checkedInToday ? (
          !attendance.hasCheckedOut ? (
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="bg-zinc-800 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              {submitting ? '...' : 'Marcar salida'}
            </button>
          ) : (
            <span className="text-emerald-400 text-xs font-semibold whitespace-nowrap">
              {'\u2713'} Completado
            </span>
          )
        ) : (
          <button
            onClick={handleCheckin}
            disabled={submitting}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {submitting ? '...' : 'Marcar asistencia'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceCheckin;
