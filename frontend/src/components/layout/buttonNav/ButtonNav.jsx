import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const getNavItems = (chatDisabled) => [
  { path: '/rutinas', activePaths: ['/rutinas', '/routineView'], label: 'Rutinas', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z' },
  { path: '/', label: 'Inicio', icon: 'M12 3L4 9v12h5v-7h6v7h5V9z' },
  { path: '/profile', label: 'Perfil', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { path: '/chat', label: 'Chat IA', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z', disabled: chatDisabled },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chatDisabled, setChatDisabled] = useState(false);

  useEffect(() => {
    const checkChatStatus = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/chat/status', { withCredentials: true });
        setChatDisabled(!res.data.enabled);
      } catch {
        setChatDisabled(true);
      }
    };
    checkChatStatus();
  }, []);

  const navItems = getNavItems(chatDisabled);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800">
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 h-[72px] pb-2">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : item.activePaths
              ? item.activePaths.some(p => location.pathname.startsWith(p))
              : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => !item.disabled && navigate(item.path)}
              disabled={item.disabled}
              className={`
                flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-300
                ${item.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive
                  ? 'bg-blue-600 shadow-lg shadow-blue-600/30 -translate-y-2 scale-105'
                  : 'bg-transparent translate-y-0 scale-100 hover:bg-zinc-800'}
              `}
            >
              <svg className={`w-6 h-6 transition-colors duration-200 ${isActive ? 'text-white' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d={item.icon} />
              </svg>
              <span className={`text-[10px] font-semibold whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
