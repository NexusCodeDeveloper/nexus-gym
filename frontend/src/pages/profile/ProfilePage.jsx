import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentProfile from './StudentProfile';
import StaffProfile from './StaffProfile';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto spdocker compose upace-y-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <span>←</span> Volver al Inicio
          </button>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>
        {user.role === 'alumno' ? (
          <StudentProfile user={user} />
        ) : (
          <StaffProfile user={user} />
        )}

      </div>
    </div>
  );
};

export default ProfilePage;