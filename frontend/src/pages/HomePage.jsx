import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  // 1. EL CASO DEL SUPER ADM: 
  // Si vos entrás a la raíz ("/"), el sistema te manda directo a tu panel sin preguntar.
  if (user?.role === 'super_adm') {
    return <Navigate to="/staff" replace />;
  }

  // 2. EL CASO DEL ALUMNO Y EL PROFESOR:
  // Ambos ven esta pantalla base.
  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabecera del Home */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Hola, {user?.name}
            </h1>
            <p className="text-zinc-500 mt-1">Bienvenido a Nexus GYM</p>
          </div>
          
          <div className="flex gap-4">
            {/* BOTÓN EXCLUSIVO PARA PROFESORES */}
            {user?.role === 'profesor' && (
              <Link 
                to="/rutinas" // A futuro crearemos esta ruta
                className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-2"
              >
                <span>⚡</span> Panel de Profesor
              </Link>
            )}
            
            {/* Botón de perfil general */}
            <Link 
              to="/profile" 
              className="bg-white border border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm"
            >
              Mi Perfil
            </Link>
          </div>
        </header>

        {/* CONTENIDO GENERAL (Lo ven alumnos y profes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Tu Progreso</h2>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-sm">
              Gráfico de progreso próximamente...
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Rutina de Hoy</h2>
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-sm">
              Ejercicios asignados próximamente...
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;