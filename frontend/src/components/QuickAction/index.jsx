import { Link } from 'react-router-dom';

const QuickAction = ({ to, label, description, icon, color = 'zinc' }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-900/30',
    emerald: 'from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-900/30',
    amber: 'from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-900/30',
    red: 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-900/30',
    violet: 'from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 shadow-violet-900/30',
    zinc: 'from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700',
  };

  const Wrapper = to ? Link : 'button';

  return (
    <Wrapper
      to={to}
      className={`relative group bg-gradient-to-br ${colorClasses[color] || colorClasses.zinc} rounded-2xl p-6 border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
      <div className="relative z-10 flex items-center gap-4">
        {icon && <span className="text-3xl">{icon}</span>}
        <div className="flex-1">
          <p className="font-bold text-lg text-white">{label}</p>
          {description && <p className="text-sm text-white/60 mt-0.5">{description}</p>}
        </div>
        <span className="text-xl text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
      </div>
    </Wrapper>
  );
};

export default QuickAction;
