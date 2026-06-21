import React from 'react';
import { useAuth } from '../../context/AuthContext';

const LicenseGuard = ({ children }) => {
  const { user } = useAuth();

  // Al Super Admin nada lo frena
  if (user?.role === 'superAdmin') {
    return children;
  }

  // Si no hay datos cargados aún, mostramos un estado de carga limpio
  if (!user) return null;

  // Normalizamos las fechas eliminando las horas para evitar descalces de zonas horarias
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = user.licenseStartDate ? new Date(user.licenseStartDate) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);

  const endDate = user.licenseEndDate ? new Date(user.licenseEndDate) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);

  // Cálculos de control
  const daysLeft = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : 0;
  const hasStarted = startDate ? today >= startDate : false;

  // CONDICIÓN 1: Bloqueo Total (Fuera de fecha o cuenta suspendida de la base de datos)
  if (user.isActive === false || !hasStarted || daysLeft < 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-zinc-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Acceso Restringido</h2>
          <p className="text-zinc-600 mb-6 text-sm">
            {user.isActive === false 
              ? "Tu cuenta ha sido suspendida manualmente por la administración." 
              : "Tu licencia de uso ha caducado por falta de pago o aún no inició el período contratado."}
          </p>
          <p className="text-xs text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-200 font-medium">
            Por favor, comunicate con el administrador de Nexus para regularizar tu situación y reactivar la plataforma.
          </p>
        </div>
      </div>
    );
  }

  // CONDICIÓN 2: Cartel de advertencia preventiva (5 días o menos)
  return (
    <>
      {daysLeft <= 5 && daysLeft >= 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 text-yellow-800 text-sm font-medium text-center flex justify-center items-center gap-2">
          ⚠️ <p>Atención: Tu licencia vence en <strong>{daysLeft} días</strong>. Contactá a soporte para renovarla y evitar la suspensión del servicio.</p>
        </div>
      )}
      {children}
    </>
  );
};

export default LicenseGuard;