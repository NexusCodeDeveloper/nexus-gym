import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/login/Login.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import SuperAdminPanel from "./pages/superAdmin/SuperAdminPanel.jsx";
import LicenseGuard from "./components/license/LicenseGuard.jsx";
import TeacherPanel from "./pages/TeacherPanel/TeacherPanel.jsx";
import RoutineList from "./pages/routineList/RoutineList.jsx";
import RoutineView from "./pages/routineView/RoutineView.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/rutinas" element={<RoutineList />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/routineView/:id" element={<RoutineView />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["profesor", "admin"]} />}>
            <Route path="/teacherPanel" element={<TeacherPanel />} />
            <Route path="/editRoutine/:id" element={<TeacherPanel />} />
          </Route>          
          <Route element={<ProtectedRoute allowedRoles={["superAdmin"]} />}>
            <Route path="/nexusControl" element={<SuperAdminPanel />} />
          </Route>         
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/adminDashboard" element={<LicenseGuard><UserManagement /></LicenseGuard>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;