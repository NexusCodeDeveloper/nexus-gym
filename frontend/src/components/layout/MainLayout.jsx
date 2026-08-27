import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './buttonNav/ButtonNav.jsx';
import Watermark from '../watermark/Watermark.jsx';
import { useAuth } from '../../context/AuthContext';
import useScreenshotDetection from '../../hooks/useScreenshotDetection';
import useSecurityAlerts from '../../hooks/useSecurityAlerts';

const FULL_SCREEN_PATHS = ['/nexusControl', '/adminDashboard'];

const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  useScreenshotDetection();
  useSecurityAlerts();

  const hideNav = FULL_SCREEN_PATHS.some(p => location.pathname.startsWith(p));
  const showWatermark = user && (user.role === 'alumno' || user.role === 'admin');

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className={hideNav ? '' : 'pb-24'}>
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
      {showWatermark && <Watermark user={user} />}
    </div>
  );
};

export default MainLayout;