import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav/index.jsx';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
