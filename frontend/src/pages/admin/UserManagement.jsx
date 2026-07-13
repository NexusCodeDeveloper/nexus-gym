import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast, showConfirmDialog, showDeleteConfirmDialog } from "../../utils/swal";
import AttendanceToday from "../../components/attendance/AttendanceToday.jsx";
import api from "../../service/api.js";

const userSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 letras")
    .max(50, "El nombre es muy largo"),
  dni: z.string().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números sin puntos"),
  licenseStartDate: z.string().nonempty("La fecha de inicio es requerida"),
  licenseEndDate: z.string().nonempty("La fecha de fin es requerida"),
  role: z.string().nonempty("El rol es requerido"),
});

const licenseSchema = z.object({
  licenseStartDate: z.string().nonempty("La fecha de inicio es requerida"),
  licenseEndDate: z.string().nonempty("La fecha de fin es requerida"),
});

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDni, setSearchDni] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [view, setView] = useState('users');
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    licenseStartDate: "",
    licenseEndDate: "",
    role: "alumno",
  });
  const [editFormData, setEditFormData] = useState({
    licenseStartDate: "",
    licenseEndDate: "",
  });
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = result.error.format();
      setErrors({
        name: formattedErrors.name?._errors[0],
        dni: formattedErrors.dni?._errors[0],
        licenseStartDate: formattedErrors.licenseStartDate?._errors[0],
        licenseEndDate: formattedErrors.licenseEndDate?._errors[0],
        role: formattedErrors.role?._errors[0],
      });
      return;
    }

    const newUserPayload = {
      name: formData.name,
      dni: formData.dni,
      password: formData.dni,
      email: `${formData.dni}@nexusgym.com`,
      role: formData.role,
      createdBy: user?.id,
      licenseStartDate: formData.licenseStartDate,
      licenseEndDate: formData.licenseEndDate,
    };

    try {
      await api.post("/api/auth/register", newUserPayload);
      setIsModalOpen(false);
      setFormData({
        name: "",
        dni: "",
        licenseStartDate: "",
        licenseEndDate: "",
        role: "alumno",
      });
      showSuccessToast("¡Usuario creado exitosamente!");
      fetchUsers();
    } catch (error) {
      console.error("Error creating user", error);
      showErrorToast(error.response?.data?.message || "Ocurrió un error al crear el usuario");
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      licenseStartDate: user.licenseStartDate
        ? new Date(user.licenseStartDate).toISOString().split("T")[0]
        : "",
      licenseEndDate: user.licenseEndDate
        ? new Date(user.licenseEndDate).toISOString().split("T")[0]
        : "",
    });
    setIsEditModalOpen(true);
    setEditErrors({});
  };

  const handleUpdateLicense = async (e) => {
    e.preventDefault();
    setEditErrors({});

    const result = licenseSchema.safeParse(editFormData);

    if (!result.success) {
      const formattedErrors = result.error.format();
      setEditErrors({
        licenseStartDate: formattedErrors.licenseStartDate?._errors[0],
        licenseEndDate: formattedErrors.licenseEndDate?._errors[0],
      });
      return;
    }

    try {
      await api.put(`/api/admin/users/${editingUser._id}/license`, editFormData);
      setIsEditModalOpen(false);
      showSuccessToast("¡Licencia actualizada!");
      fetchUsers();
    } catch (error) {
      console.error("Error updating license", error);
      showErrorToast(error.response?.data?.message || "Ocurrió un error al actualizar la licencia");
    }
  };

  const handleSuspendUser = async (userId, isActive) => {
    const actionText = isActive ? 'suspender' : 'activar';
    const isConfirmed = await showConfirmDialog({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario?`,
      text: `Confirmas que quieres ${actionText} a este usuario?`,
      confirmButtonText: `Sí, ${actionText}`
    });

    if (!isConfirmed) return;

    try {
      await api.put(`/api/admin/users/${userId}/suspend`, {});
      showSuccessToast(`Usuario ${actionText === 'suspender' ? 'suspendido' : 'activado'} con éxito.`);
      fetchUsers();
    } catch (error) {
      console.error(`Error al ${actionText} el usuario`, error);
      showErrorToast(error.response?.data?.message || `Ocurrió un error al ${actionText} al usuario`);
    }
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = await showDeleteConfirmDialog({
      title: '¿Eliminar este usuario?',
      text: "Esta acción no se puede deshacer."
    });

    if (!isConfirmed) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      showSuccessToast('¡Usuario eliminado!');
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
      showErrorToast(error.response?.data?.message || "Ocurrió un error al eliminar el usuario");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <span>←</span> Volver al Inicio
        </button>

        <div className="mb-6 flex gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800 w-fit">
          <button
            onClick={() => setView('users')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'users' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setView('attendance')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'attendance' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Asistencia Profesores
          </button>
        </div>

        {view === 'users' && (
          <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                  Gestión de Usuarios
                </h1>
                <p className="text-zinc-400 mt-1">
                  Control de la base de usuarios del gimnasio
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/exercise-library"
                  className="bg-zinc-800 text-zinc-300 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  Video Librería
                </Link>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setErrors({});
                  }}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors shadow-sm"
                >
                  + Nuevo Usuario
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-zinc-800">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Buscar por DNI..."
                  maxLength={8}
                  value={searchDni}
                  onChange={(e) => setSearchDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="w-full sm:w-64 p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-800/50 border-b border-zinc-700 text-zinc-400 font-medium">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm">Usuario</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm table-cell">Acceso</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm table-cell">Rol</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm table-cell">Vencimiento</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm">Estado</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-zinc-300 text-xs sm:text-sm">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-zinc-400"
                    >
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-zinc-400"
                    >
                      No hay usuarios registrados aún.
                    </td>
                  </tr>
                ) : (
                  users.filter(u => u.dni && u.dni.includes(searchDni)).map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-zinc-100 text-sm sm:text-base">
                        {user.name}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">
                        {user.dni || "Sin DNI"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">{user.role}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">
                        {user.licenseEndDate
                          ? new Date(user.licenseEndDate)
                              .toISOString()
                              .split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            user.isActive
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {user.isActive ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-zinc-400 hover:text-zinc-100 font-medium px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user._id, user.isActive)}
                            className={`font-medium px-2 py-1 text-xs rounded-md transition-colors ${
                              user.isActive
                                ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                            }`}
                          >
                            {user.isActive ? "Suspender" : "Activar"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-500 hover:text-red-400 font-medium px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {view === 'attendance' && <AttendanceToday />}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-100">
                  Registrar Usuario
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100 ${
                      errors.name ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    DNI (Servirá para ingresar)
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100 ${
                      errors.dni ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.dni && (
                    <p className="text-red-500 text-xs mt-1">{errors.dni}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-300 ${
                      errors.role ? "border-red-500" : "border-zinc-200"
                    }`}
                  >
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Inicio de Licencia
                  </label>
                  <input
                    type="date"
                    value={formData.licenseStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseStartDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-300 ${
                      errors.licenseStartDate
                        ? "border-red-500"
                        : "border-zinc-700"
                    }`}
                  />
                  {errors.licenseStartDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.licenseStartDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Fin de Licencia
                  </label>
                  <input
                    type="date"
                    value={formData.licenseEndDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseEndDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-300 ${
                      errors.licenseEndDate
                        ? "border-red-500"
                        : "border-zinc-700"
                    }`}
                  />
                  {errors.licenseEndDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.licenseEndDate}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors mt-6"
                >
                  Crear Cuenta de Usuario
                </button>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-100">
                  Editar Licencia
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Inicio de Licencia
                  </label>
                  <input
                    type="date"
                    value={editFormData.licenseStartDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        licenseStartDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-300 ${
                      editErrors.licenseStartDate
                        ? "border-red-500"
                        : "border-zinc-700"
                    }`}
                  />
                  {editErrors.licenseStartDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {editErrors.licenseStartDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Fin de Licencia
                  </label>
                  <input
                    type="date"
                    value={editFormData.licenseEndDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        licenseEndDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-300 ${
                      editErrors.licenseEndDate
                        ? "border-red-500"
                        : "border-zinc-700"
                    }`}
                  />
                  {editErrors.licenseEndDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {editErrors.licenseEndDate}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors mt-6"
                >
                  Actualizar Licencia
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
