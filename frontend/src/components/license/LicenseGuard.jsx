import React from 'react';
import { useAuth } from '../../context/AuthContext';

const LicenseGuard = ({ children }) => {
  const { user } = useAuth();

  // A vos (Super Admin) nada te bloquea
  if (user?.role === 'superAdmin') {
    return children;
  }

  // Calculamos los días restantes
  const today = new Date();
  const endDate = new Date(user?.licenseEndDate);
  const startDate = new Date(user?.licenseStartDate);
  
  // Math.ceil redondea los milisegundos a días enteros
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  const hasStarted = today >= startDate;

  // CONDICIÓN 1: Bloqueo Total (Fuera de fecha o cuenta suspendida manualmente)
  if (!user?.isActive || !hasStarted || daysLeft < 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Acceso Restringido</h2>
          <p className="text-zinc-600 mb-6">
            {!user?.isActive 
              ? "Tu cuenta ha sido suspendida." 
              : "Tu licencia de uso ha caducado por falta de pago o fin del período contratado."}
          </p>
          <p className="text-sm text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
            Por favor, comunicate con el administrador de Nexus para regularizar tu situación y reactivar la plataforma.
          </p>
        </div>
      </div>
    );
  }

  // CONDICIÓN 2: Advertencia de Vencimiento Cercano (5 días o menos)
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