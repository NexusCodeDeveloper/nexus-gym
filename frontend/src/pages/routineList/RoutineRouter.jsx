import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import RoutineList from './RoutineList.jsx';

const RoutineRouter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redirectTo, setRedirectTo] = useState(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'alumno') {
      const fetchFirstRoutine = async () => {
        try {
          const res = await axios.get('http://localhost:4000/api/routines/mis-rutinas', { withCredentials: true });
          const routines = res.data;
          if (routines.length > 0) {
            navigate(`/routineView/${routines[0]._id}`, { replace: true });
          } else {
            setRedirectTo('empty');
          }
        } catch (err) {
          setRedirectTo('empty');
        }
      };
      fetchFirstRoutine();
    } else {
      setShowList(true);
    }
  }, [user, navigate]);

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
