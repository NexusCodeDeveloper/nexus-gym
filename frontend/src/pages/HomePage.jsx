import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 p-4 sm:p-8 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        
        <header className="relative bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden">

          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-zinc-100 to-transparent rounded-full blur-3xl -z-10" />
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
                Hola, {user?.name || 'Usuario'}
              </h1>
            </div>
            <p className="text-zinc-500 font-medium text-sm sm:text-base">
              Bienvenido a <span className="text-zinc-950 font-bold">Nexus GYM</span> • Gestión de Alto Rendimiento
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
              className="bg-white border border-zinc-200 text-zinc-700 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              Mi Perfil
            </Link>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group md:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                  {user?.role === 'alumno' ? 'Tu Progreso Semanal' : 'Métricas del Sistema'}
                </h2>
                <span className="p-2 bg-zinc-100 rounded-xl text-zinc-600 font-bold text-xs group-hover:bg-zinc-950 group-hover:text-white transition-colors duration-300">
                  {user?.role === 'superAdmin' ? 'Global' : user?.role === 'admin' ? 'Gimnasio' : user?.role === 'profesor' ? 'Alumnos' : 'Rendimiento'}
                </span>
              </div>

              <div className="h-44 flex flex-col items-center justify-center border border-dashed border-zinc-200 bg-zinc-50/50 rounded-2xl p-4">
                {user?.role === 'alumno' ? (
                  <div className="flex gap-2 items-end h-28 w-full justify-center px-4">
                    <div className="bg-zinc-200 w-full h-[40%] rounded-t-lg transition-all group-hover:bg-zinc-300" />
                    <div className="bg-zinc-200 w-full h-[65%] rounded-t-lg transition-all group-hover:bg-zinc-300" />
                    <div className="bg-zinc-200 w-full h-[50%] rounded-t-lg transition-all group-hover:bg-zinc-300" />
                    <div className="bg-zinc-900 w-full h-[90%] rounded-t-lg shadow-sm" />
                    <div className="bg-zinc-100 w-full h-[20%] rounded-t-lg border border-zinc-200" />
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500">
                      <span>{user?.role === 'superAdmin' ? 'Licencias activas' : 'Alumnos con rutina activa'}</span>
                      <span className="text-zinc-900">{user?.role === 'superAdmin' ? '100%' : '84%'}</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-zinc-900 h-full w-[84%] rounded-full" />
                    </div>
                    <p className="text-xs text-center text-zinc-400 mt-2 font-medium">
                      {user?.role === 'superAdmin' ? 'Todos los servidores operando correctamente.' : 'Gráficos analíticos de asistencia en desarrollo...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 font-medium mt-4">Última actualización: Hoy, hace unos instantes</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                  {user?.role === 'alumno' ? 'Entrenamiento de Hoy' : 'Accesos Rápidos'}
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-3">
                {user?.role === 'superAdmin' ? (
                  <>
                    <Link 
                      to="/nexusControl" 
                      className="w-full p-3 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl flex items-center justify-between transition-all font-semibold text-sm group/btn"
                    >
                      <span>Control de Clientes</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                    <div className="w-full p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs text-zinc-400 font-medium text-center">
                      Entorno global de licencias.
                    </div>
                  </>
                ) : user?.role === 'admin' ? (
                  <>
                    <Link 
                      to="/adminDashboard" 
                      className="w-full p-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl flex items-center justify-between transition-all font-semibold text-sm group/btn"
                    >
                      <span>Gestionar Staff</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                  </>
                ) : user?.role === 'profesor' ? (
                  <>
                    <Link 
                      to="/teacher-panel" 
                      className="w-full p-3 bg-zinc-50 hover:bg-zinc-900 hover:text-white border border-zinc-200/60 rounded-xl flex items-center justify-between transition-all font-semibold text-sm group/btn"
                    >
                      <span>Crear Nueva Rutina</span>
                      <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                    </Link>
                    <div className="w-full p-3 bg-zinc-50/50 border border-zinc-100 rounded-xl text-xs text-zinc-400 font-medium text-center">
                      Módulo de asignación en desarrollo...
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">Enfoque principal</span>
                      <p className="text-base font-bold text-zinc-800">Piernas & Zona Media</p>
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

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Estado del Sistema</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Activo</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default HomePage;