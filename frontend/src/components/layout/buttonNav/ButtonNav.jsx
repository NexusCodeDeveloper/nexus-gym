import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/rutinas', activePaths: ['/rutinas', '/routineView', '/teacherPanel', '/editRoutine'], label: 'Rutinas', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z' },
  { path: '/', activePaths: ['/nexusControl', '/adminDashboard', '/exercise-library'], label: 'Inicio', icon: 'M12 3L4 9v12h5v-7h6v7h5V9z' },
  { path: '/profile', label: 'Perfil', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-zinc-900/70 backdrop-blur-2xl border-t border-white/10 shadow-[0_-12px_40px_rgba(0,0,0,0.6)]">
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
                onClick={() => navigate(item.path)}
                className={`
                  relative flex flex-col items-center gap-1 px-6 pt-2 pb-1.5 rounded-2xl
                  transition-all duration-300 ease-out cursor-pointer select-none
                  ${isActive
                    ? 'bg-gradient-to-b from-blue-500 to-blue-700 [transform:perspective(500px)_translateY(-10px)_rotateX(10deg)_scale(1.08)] shadow-[0_14px_30px_-8px_rgba(59,130,246,0.55),0_6px_12px_rgba(0,0,0,0.45)]'
                    : 'bg-transparent [transform:perspective(500px)_translateY(0px)_rotateX(0deg)_scale(1)] hover:bg-zinc-800/70 hover:[transform:perspective(500px)_translateY(-4px)_rotateX(2deg)_scale(1.02)] active:[transform:perspective(500px)_translateY(0px)_rotateX(0deg)_scale(0.98)]'}
                `}
              >
                <svg className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_2px_6px_rgba(255,255,255,0.35)]' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d={item.icon} />
                </svg>
                <span className={`text-[10px] font-semibold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                  {item.label}
                </span>
                <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;