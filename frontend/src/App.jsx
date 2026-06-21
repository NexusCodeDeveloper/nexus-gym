import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/login/Login.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import StaffManagement from "./pages/admin/StaffManangement.jsx";
import SuperAdminPanel from "./pages/superAdmin/SuperAdminPanel.jsx";
import LicenseGuard from "./components/license/LicenseGuard.jsx";
import TeacherPanel from "./pages/TeacherPanel/TeacherPanel.jsx";
import RoutineList from './pages/routineList/RoutineList.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas accesibles para CUALQUIER usuario logueado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/rutinas" element={<RoutineList />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Ruta EXCLUSIVA del Profesor (Se le cambió el path para no chocar) */}
          <Route element={<ProtectedRoute allowedRoles={["profesor"]} />}>
            <Route path="/teacher-panel" element={<TeacherPanel />} />
          </Route>

          {/* Ruta EXCLUSIVA del Super Admin */}
          <Route element={<ProtectedRoute allowedRoles={["superAdmin"]} />}>
            <Route path="/nexusControl" element={<SuperAdminPanel />} />
          </Route>

          {/* Ruta EXCLUSIVA del Admin (Gimnasio) */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin-dashboard"
              element={
                <LicenseGuard>
                  <StaffManagement />
                </LicenseGuard>
              }
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 