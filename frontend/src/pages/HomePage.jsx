import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/statCard/StatCard.jsx';
import QuickAction from '../components/quickAction/QuickAction.jsx';
import api from '../service/api.js';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profAttendance, setProfAttendance] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'superAdmin') {
          const res = await api.get('/api/super-admin/admins');
          const admins = res.data || [];
          const expiring = admins.filter(a => {
            if (!a.licenseEndDate) return false;
            const daysLeft = Math.ceil((new Date(a.licenseEndDate) - today) / (1000 * 60 * 60 * 24));
            return daysLeft <= 7 && daysLeft >= 0;
          });
          setStats({
            total: admins.length,
            active: admins.filter(a => a.isActive).length,
            suspended: admins.filter(a => !a.isActive).length,
            expiring: expiring.length,
            admins,
          });
        } else if (user?.role === 'admin') {
          const [statsRes, attendanceRes] = await Promise.all([
            api.get('/api/profile/stats'),
            api.get('/api/attendance/gym'),
          ]);
          setStats(statsRes.data);
          setProfAttendance(attendanceRes.data);
        } else if (user?.role === 'profesor') {
          const [routinesRes, alumnosRes] = await Promise.all([
            api.get('/api/routines/mis-rutinas'),
            api.get('/api/auth/alumnos'),
          ]);
          setStats({
            routines: routinesRes.data?.length || 0,
            alumnos: alumnosRes.data?.length || 0,
            routinesList: routinesRes.data || [],
            alumnosList: alumnosRes.data || [],
          });
        } else if (user?.role === 'alumno') {
          const res = await api.get('/api/routines/mis-rutinas');
          const routinesList = res.data || [];
          const totalExercises = routinesList.reduce((sum, r) =>
            sum + (r.days?.reduce((daySum, d) => daySum + (d.exercises?.length || 0), 0) || 0), 0);
          setStats({
            routines: routinesList.length,
            totalExercises,
            routinesList,
          });
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const daysUntilLicenseEnd = () => {
    if (!user?.licenseEndDate) return null;
    return Math.ceil((new Date(user.licenseEndDate) - today) / (1000 * 60 * 60 * 24));
  };

  const licenseStatus = () => {
    const days = daysUntilLicenseEnd();
    if (days === null) return null;
    if (days < 0) return { label: 'Vencida', color: 'red', icon: '🔴' };
    if (days <= 7) return { label: `Vence en ${days} días`, color: 'amber', icon: '🟡' };
    return { label: `${days} días restantes`, color: 'emerald', icon: '🟢' };
  };

  const getLastWeight = () => {
    const wh = user?.metrics?.weightHistory;
    if (!wh || wh.length === 0) return null;
    return wh[wh.length - 1];
  };

  const getLastPr = () => {
    const ph = user?.metrics?.prsHistory;
    if (!ph || ph.length === 0) return null;
    return ph[ph.length - 1];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Cargando tus datos...</p>
      </div>
    );
  }

  const licenseBadge = () => {
    const days = daysUntilLicenseEnd();
    if (days === null) return null;
    if (days < 0) return { label: 'Licencia vencida', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (days <= 7) return { label: `${days} día${days !== 1 ? 's' : ''} restantes`, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: `${days} días restantes`, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

        {/* ─── SUPER ADMIN ─── */}
        {user.role === 'superAdmin' && (
          <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    Nexus Control
                  </h1>
                  {licenseBadge() && (
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${licenseBadge().color}`}>
                      {licenseBadge().label}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 mt-1 font-medium text-sm sm:text-base">
                  Panel global de supervisión
                </p>
              </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Gimnasios" value={loading ? '...' : stats?.total || 0} icon="🏢" color="blue" />
              <StatCard label="Activos" value={loading ? '...' : stats?.active || 0} icon="✅" color="emerald" />
              <StatCard label="Suspendidos" value={loading ? '...' : stats?.suspended || 0} icon="⛔" color="red" />
              <StatCard label="Próximos a vencer" value={loading ? '...' : stats?.expiring || 0} icon="⏳" color="amber" />
            </div>

            <Link
              to="/nexusControl"
              className="group relative block bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-2xl p-5 border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-red-900/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex items-center gap-4">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-white">Ir al Panel de Control</p>
                  <p className="text-sm text-white/60 mt-0.5">Gestionar licencias, clientes y accesos</p>
                </div>
                <span className="text-xl text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>

            <section>
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Últimos Clientes</h2>
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : stats?.admins?.length === 0 ? (
                  <p className="p-6 text-center text-zinc-500">No hay gimnasios registrados.</p>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {stats?.admins?.slice(0, 5).map(admin => (
                      <div key={admin._id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${admin.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="font-medium text-zinc-200 truncate text-sm sm:text-base">{admin.name}</span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-zinc-500 shrink-0 ml-2">
                          {admin.licenseEndDate ? `${Math.ceil((new Date(admin.licenseEndDate) - today) / (1000 * 60 * 60 * 24))} días` : 'Sin licencia'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ─── ADMIN (DUEÑO) ─── */}
        {user.role === 'admin' && (
          <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    {user.name}
                  </h1>
                  {licenseStatus() && (
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${
                      licenseStatus().color === 'red' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      licenseStatus().color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {licenseStatus().icon} {licenseStatus().label}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 font-medium text-sm sm:text-base">Panel de gestión del gimnasio</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/adminDashboard" className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-500 transition-all text-center">Gestión Completa</Link>
              </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Alumnos activos" value={loading ? '...' : stats?.activeStudents || 0} icon="👥" color="blue" />
              <StatCard label="Profesores activos" value={loading ? '...' : stats?.activeTeachers || 0} icon="👨‍🏫" color="violet" />
              <StatCard label="Rutinas creadas" value={loading ? '...' : stats?.totalRoutines || 0} icon="📋" color="emerald" />
              <StatCard label="Asistencia" value={loading ? '...' : `${stats?.attendanceRate || 0}%`} icon="📈" color="amber" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction to="/adminDashboard" label="Gestionar Usuarios" description="Dar de alta alumnos y profesores" icon="👤" color="blue" />
              <QuickAction to="/rutinas" label="Ver Rutinas" description="Rutinas de todo el gimnasio" icon="📋" color="zinc" />
            </div>

            {licenseStatus()?.color === 'red' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
                <p className="text-red-400 font-bold text-lg">Tu licencia ha vencido</p>
                <p className="text-red-400/70 text-sm mt-1">Comunicate con tu administrador para renovar el acceso.</p>
              </div>
            )}
            {licenseStatus()?.color === 'amber' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-400 font-bold">Tu licencia está por vencer</p>
                  <p className="text-amber-400/70 text-sm">{licenseStatus()?.label}</p>
                </div>
                <Link to="/profile" className="text-sm font-semibold text-amber-400 hover:text-amber-300 underline">Ver más</Link>
              </div>
            )}

            {/* ASISTENCIA DE PROFESORES */}
            {profAttendance && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-zinc-100">Asistencia de Profesores</h2>
                  <span className="text-xs text-zinc-500">
                    {profAttendance.todayCheckIns} / {profAttendance.totalProfessors} marcaron hoy
                  </span>
                </div>
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  {profAttendance.professors?.length === 0 ? (
                    <p className="p-6 text-center text-zinc-500">No hay profesores registrados.</p>
                  ) : (
                    <div className="divide-y divide-zinc-800">
                      {profAttendance.professors.map(p => (
                        <div key={p._id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.checkedInToday ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-zinc-600'}`} />
                            <span className="font-medium text-zinc-200 truncate text-sm sm:text-base">{p.name}</span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            {p.checkedInToday ? (
                              <span className="text-xs text-emerald-400 font-semibold">
                                ✓ {p.lastCheckIn ? new Date(p.lastCheckIn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-500">Ausente</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* ─── PROFESOR ─── */}
        {user.role === 'profesor' && (
          <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    Hola, {user.name}
                  </h1>
                  {licenseBadge() && (
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${licenseBadge().color}`}>
                      {licenseBadge().label}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 mt-1 font-medium text-sm sm:text-base">Panel del profesor</p>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Mis Alumnos" value={loading ? '...' : stats?.alumnos || 0} icon="👥" color="blue" />
              <StatCard label="Rutinas Creadas" value={loading ? '...' : stats?.routines || 0} icon="📋" color="emerald" />
            </div>

            <Link
              to="/teacherPanel"
              className="group relative block bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl p-5 border border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-emerald-900/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10 flex items-center gap-4">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="font-bold text-lg text-white">Crear Nueva Rutina</p>
                  <p className="text-sm text-white/60 mt-0.5">Diseñá un plan de entrenamiento personalizado</p>
                </div>
                <span className="text-xl text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>

            <section>
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Mis Alumnos</h2>
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : stats?.alumnosList?.length === 0 ? (
                  <p className="p-6 text-center text-zinc-500">No tenés alumnos asignados aún.</p>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {stats?.alumnosList?.slice(0, 6).map(alumno => (
                      <div key={alumno._id} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${alumno.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="font-medium text-zinc-200 truncate text-sm sm:text-base">{alumno.name}</span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-zinc-500 shrink-0 ml-2">{alumno.licenseEndDate ? `Plan hasta ${formatDate(alumno.licenseEndDate)}` : '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ─── ALUMNO ─── */}
        {user.role === 'alumno' && (
          <>
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                    Hola, {user.name}
                  </h1>
                  {licenseBadge() && (
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${licenseBadge().color}`}>
                      {licenseBadge().label}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 mt-1 font-medium text-sm sm:text-base">Seguí tu progreso día a día</p>
              </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Peso actual"
                value={getLastWeight() ? `${getLastWeight().weight} kg` : '—'}
                icon="⚖️"
                color="blue"
              />
              <StatCard
                label="Último PR"
                value={getLastPr() ? `${getLastPr().squat || '—'}/${getLastPr().benchPress || '—'}/${getLastPr().deadlift || '—'}` : '—'}
                icon="🏋️"
                color="violet"
              />
              <StatCard
                label="Rutina dia"
                value={new Date().toLocaleDateString('es-AR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase())}
                icon="📋"
                color="emerald"
              />
              <StatCard
                label="Último registro"
                value={getLastWeight() ? formatDate(getLastWeight().date) : '—'}
                icon="📅"
                color="amber"
              />
            </div>

            {stats?.routinesList?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickAction to="/rutinas" label="Ver mis rutinas"  icon="📋" color="blue" />
                <QuickAction to="/profile" label="Actualizar progreso" description="Registrá tu peso y marcas personales" icon="📊" color="emerald" />
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-zinc-300 font-bold text-lg">Todavía no tenés rutinas asignadas</p>
                <p className="text-zinc-500 text-sm mt-1">Tu profesor te asignará un plan de entrenamiento pronto.</p>
              </div>
            )}

            <section>
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Evolución de peso</h2>
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                {getLastWeight() ? (
                  <div className="flex gap-1 sm:gap-2 h-28 sm:h-32">
                    {user?.metrics?.weightHistory?.slice(-7).map((entry, i) => {
                      const maxWeight = Math.max(...user.metrics.weightHistory.slice(-7).map(e => e.weight));
                      const flexVal = maxWeight ? entry.weight / maxWeight : 0.01;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium">{entry.weight}</span>
                          <div className="w-full flex-1 flex flex-col-reverse">
                            <div
                              className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-400"
                              style={{ flex: flexVal }}
                            />
                            <div style={{ flex: 1 - flexVal }} />
                          </div>
                          <span className="text-[8px] sm:text-[10px] text-zinc-600">{formatDate(entry.date)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-sm">Aún no tenés registros de peso.</p>
                    <p className="text-xs text-zinc-600 mt-1">Actualizá tu progreso desde el perfil para ver tu evolución.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Footer común */}
        <footer className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-600">
          Desarrollo by NexusCode
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
