import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/login/Login.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import SuperAdminPanel from "./pages/superAdmin/SuperAdminPanel.jsx";
import LicenseGuard from "./components/license/LicenseGuard.jsx";
import TeacherPanel from "./pages/TeacherPanel/TeacherPanel.jsx";
import ExerciseLibrary from "./pages/admin/ExerciseLibrary/index.jsx";
import RoutineRouter from "./pages/routineList/RoutineRouter.jsx";
import RoutineView from "./pages/routineView/RoutineView.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import ChatPage from "./pages/chat/ChatPage.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/rutinas" element={<RoutineRouter />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/routineView/:id" element={<RoutineView />} />
              <Route path="/teacherPanel" element={<ProtectedRoute allowedRoles={["profesor", "admin"]}><TeacherPanel /></ProtectedRoute>} />
              <Route path="/editRoutine/:id" element={<ProtectedRoute allowedRoles={["profesor", "admin"]}><TeacherPanel /></ProtectedRoute>} />
              <Route path="/nexusControl" element={<ProtectedRoute allowedRoles={["superAdmin"]}><SuperAdminPanel /></ProtectedRoute>} />
              <Route path="/adminDashboard" element={<ProtectedRoute allowedRoles={["admin"]}><LicenseGuard><UserManagement /></LicenseGuard></ProtectedRoute>} />
              <Route path="/exercise-library" element={<ProtectedRoute allowedRoles={["admin"]}><ExerciseLibrary /></ProtectedRoute>} />
            </Route>
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
