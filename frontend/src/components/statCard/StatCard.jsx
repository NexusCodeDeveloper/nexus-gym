const StatCard = ({ label, value, icon, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
    zinc: 'from-zinc-500/20 to-zinc-600/5 border-zinc-500/20 text-zinc-400',
  };

  const glowMap = {
    blue: 'shadow-blue-500/10 group-hover:shadow-blue-500/25',
    emerald: 'shadow-emerald-500/10 group-hover:shadow-emerald-500/25',
    amber: 'shadow-amber-500/10 group-hover:shadow-amber-500/25',
    red: 'shadow-red-500/10 group-hover:shadow-red-500/25',
    violet: 'shadow-violet-500/10 group-hover:shadow-violet-500/25',
    zinc: 'shadow-zinc-500/10 group-hover:shadow-zinc-500/25',
  };

  const iconBgMap = {
    blue: 'bg-blue-500/15',
    emerald: 'bg-emerald-500/15',
    amber: 'bg-amber-500/15',
    red: 'bg-red-500/15',
    violet: 'bg-violet-500/15',
    zinc: 'bg-zinc-500/15',
  };

  const isLongValue = typeof value === 'string' && value.length > 6;

  return (
    <div className={`relative bg-gradient-to-br ${colorMap[color] || colorMap.blue} rounded-2xl p-4 sm:p-5 border overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-sm ${glowMap[color] || glowMap.blue}`}>
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider uppercase opacity-60">{label}</p>
          <p className={`font-black tracking-tight truncate ${isLongValue ? 'text-base sm:text-xl' : 'text-xl sm:text-3xl'}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBgMap[color] || iconBgMap.blue} flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
