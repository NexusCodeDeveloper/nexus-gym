import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../service/api.js';
import RoutineList from './RoutineList.jsx';

const RoutineRouter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redirectTo, setRedirectTo] = useState(null);
  const [showList, setShowList] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'alumno') {
      const fetchFirstRoutine = async () => {
        try {
          const res = await api.get('/api/routines/mis-rutinas');
          const routines = res.data.data;
          if (routines.length > 0) {
            navigate(`/routineView/${routines[0]._id}`, { replace: true });
          } else {
            setRedirectTo('empty');
          }
        } catch {
          setLoadError(true);
        }
      };
      fetchFirstRoutine();
    } else {
      setShowList(true);
    }
  }, [user, navigate]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">No se pudieron cargar las rutinas</h2>
          <p className="text-zinc-500 text-sm mb-6">Intentá de nuevo en unos momentos.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (redirectTo === 'empty') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Todavía no tenés rutinas asignadas</h2>
          <p className="text-zinc-500 text-sm">Tu profesor te asignará un plan de entrenamiento pronto.</p>
        </div>
      </div>
    );
  }

  if (showList) return <RoutineList />;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
};

export default RoutineRouter;