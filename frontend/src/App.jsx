import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Login from './pages/login/Login.jsx';
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import StaffManagement from './pages/admin/StaffManangement.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
        
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['profesor']} />}>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['super_adm']} />}>
            <Route path="/staff" element={<StaffManagement />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;