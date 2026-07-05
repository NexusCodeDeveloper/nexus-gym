import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden">

          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                Hola, {user?.name || 'Usuario'}
              </h1>
            </div>
            <p className="text-zinc-400 font-medium text-sm sm:text-base">
              Bienvenido a <span className="text-zinc-100 font-bold">Nexus GYM</span> • Gestión de Alto Rendimiento
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
  
            {user?.role === 'superAdmin' && (
              <Link 
                to="/nexusControl" 
                className="bg-red-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <span className="text-base">Panel Super Admin</span> 
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link 
                to="/adminDashboard" 
                className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <span className="text-base"> Gestión de Gimnasio</span>
              </Link>
            )}

            {user?.role === 'profesor' && (
              <Link 
                to="/rutinas" 
                className="bg-zinc-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <span className="text-base">Mis Rutinas Creadas</span> 
              </Link>
            )}

            {user?.role === 'alumno' && (
              <Link 
                to="/rutinas" 
                className="bg-zinc-900 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <span className="text-base">Mis Rutinas</span> 
              </Link>
            )}

            <Link 
              to="/profile" 
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-700 hover:border-zinc-600 hover:shadow-sm transition-all"
            >
              Mi Perfil
            </Link>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group md:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight text-zinc-100">
                  {user?.role === 'alumno' ? 'Tu Progreso Semanal' : 'Métricas del Sistema'}
                </h2>
                <span className="p-2 bg-zinc-800 rounded-xl text-zinc-300 font-bold text-xs group-hover:bg-zinc-700 transition-colors duration-300">
                  {user?.role === 'superAdmin' ? 'Global' : user?.role === 'admin' ? 'Gimnasio' : user?.role === 'profesor' ? 'Alumnos' : 'Rendimiento'}
                </span>
              </div>

              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-zinc-700 bg-zinc-800/50 rounded-2xl p-4">
                {user?.role === 'alumno' ? (
                  <div className="flex gap-2 items-end h-28 w-full justify-center px-4">
                    <div className="bg-zinc-700 w-full h-[40%] rounded-t-lg transition-all group-hover:bg-zinc-600" />
                    <div className="bg-zinc-700 w-full h-[65%] rounded-t-lg transition-all group-hover:bg-zinc-600" />
                    <div className="bg-zinc-700 w-full h-[50%] rounded-t-lg transition-all group-hover:bg-zinc-600" />
                    <div className="bg-zinc-200 w-full h-[90%] rounded-t-lg shadow-sm" />
                    <div className="bg-zinc-800 w-full h-[20%] rounded-t-lg border border-zinc-700" />
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <span>{user?.role === 'superAdmin' ? 'Licencias activas' : 'Alumnos con rutina activa'}</span>
                      <span className="text-zinc-100">{user?.role === 'superAdmin' ? '100%' : '84%'}</span>
                    </div>
                    <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-zinc-300 h-full w-[84%] rounded-full" />
                    </div>
                    <p className="text-xs text-center text-zinc-500 mt-2 font-medium">
                      {user?.role === 'superAdmin' ? 'Todos los servidores operando correctamente.' : 'Gráficos analíticos de asistencia en desarrollo...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-xs text-zinc-500 font-medium mt-4">Última actualización: Hoy, hace unos instantes</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight text-zinc-100">
                  {user?.role === 'alumno' ? 'Entrenamiento de Hoy' : 'Accesos Rápidos'}
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-3">
                {user?.role === 'superAdmin' ? (
                  <>
                    <Link 
                      to="/nexusControl" 
                      className="w-full p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl flex items-center justify-between transition-all font-semibold text-sm group/btn"
                    >
                      <span>Control de Clientes</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                    <div className="w-full p-3 bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs text-zinc-500 font-medium text-center">
                      Entorno global de licencias.
                    </div>
                  </>
                ) : user?.role === 'admin' ? (
                  <>
                    <Link 
                      to="/adminDashboard" 
                      className="w-full p-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl flex items-center justify-between transition-all font-semibold text-sm group/btn"
                    >
                      <span>Gestionar Staff</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                  </>
                ) : user?.role === 'profesor' ? (
                  <>
                    <Link 
                      to="/teacher-panel" 
                      className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 rounded-xl flex items-center justify-between transition-all font-semibold text-sm group/btn"
                    >
                      <span>Crear Nueva Rutina</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                    <div className="w-full p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-xs text-zinc-500 font-medium text-center">
                      Módulo de asignación en desarrollo...
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-zinc-800 border border-zinc-700/60 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-zinc-500 tracking-wider uppercase">Enfoque principal</span>
                      <p className="text-base font-bold text-zinc-200">Piernas & Zona Media</p>
                    </div>
                    <Link 
                      to="/rutinas" 
                      className="w-full text-center block py-3 bg-zinc-900 text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                      Ver Ejercicios Asignados
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span>Estado del Sistema</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Activo</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default HomePage;