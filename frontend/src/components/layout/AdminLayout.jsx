import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();

  // Opciones del menú lateral
  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'Gestión de Staff', icon: '👥', path: '/staff' },
    { name: 'Socios', icon: '🏋️', path: '/socios' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      
      {/* Sidebar - Barra Lateral */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center justify-center border-b border-zinc-800">
          <h1 className="text-xl font-bold tracking-widest text-white">NEXUS GYM</h1>
        </div>

        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 mt-4">
            Panel Principal
          </p>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a 
                key={item.name}
                href={item.path} 
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors duration-200"
              >
                <span>{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Info del usuario logueado en la base del sidebar */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.name}</span>
              <span className="text-xs text-zinc-500 capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full text-left text-sm text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar móvil (visible solo en pantallas chicas) */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-4 md:hidden">
          <h1 className="text-lg font-bold text-zinc-900 tracking-wider">NEXUS GYM</h1>
        </header>

        {/* Área donde se inyectarán las páginas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;