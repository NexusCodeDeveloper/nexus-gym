const Watermark = ({ user }) => {
  if (!user) return null;

  const label = user.dni ? `${user.name} · DNI ${user.dni}` : user.name;

  return (
    <div className="fixed bottom-20 right-3 z-40 pointer-events-none select-none" aria-hidden="true">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/15 bg-zinc-900/40 backdrop-blur-[1px] px-2.5 py-1 rounded-lg border border-white/5">
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 116 0v3H9z" />
        </svg>
        <span className="truncate max-w-[160px]">{label}</span>
      </div>
    </div>
  );
};

export default Watermark;