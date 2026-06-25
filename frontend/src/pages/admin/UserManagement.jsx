import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      const response = await axios.get(
        "http://localhost:4000/api/admin/users",
        { withCredentials: true }
      );
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
      await axios.post(
        "http://localhost:4000/api/auth/register",
        newUserPayload,
        { withCredentials: true }
      );
      setIsModalOpen(false);
      setFormData({
        name: "",
        dni: "",
        licenseStartDate: "",
        licenseEndDate: "",
        role: "alumno",
      });
      Swal.fire({
        icon: 'success',
        title: '¡Usuario Creado!',
        text: 'El nuevo usuario ha sido registrado exitosamente.',
        showConfirmButton: false,
        timer: 1500
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.message || "Ocurrió un error al crear el usuario",
      });
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
      await axios.put(
        `http://localhost:4000/api/admin/users/${editingUser._id}/license`,
        editFormData,
        { withCredentials: true }
      );
      setIsEditModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: '¡Licencia Actualizada!',
        showConfirmButton: false,
        timer: 1500
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating license", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.response?.data?.message || "Ocurrió un error al actualizar la licencia",
      });
    }
  };

  const handleSuspendUser = async (userId, isActive) => {
    const actionText = isActive ? 'suspender' : 'activar';
    Swal.fire({
      title: `¿Estás seguro de que quieres ${actionText} este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ¡${actionText}!`,
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `http://localhost:4000/api/admin/users/${userId}/suspend`,
            {},
            { withCredentials: true }
          );
          Swal.fire(
            `¡Usuario ${actionText === 'suspender' ? 'Suspendido' : 'Activado'}!`,
            `El usuario ha sido ${actionText === 'suspender' ? 'suspendido' : 'activado'} con éxito.`,
            'success'
          );
          fetchUsers();
        } catch (error) {
          console.error(`Error al ${actionText} el usuario`, error);
          Swal.fire(
            'Error',
            error.response?.data?.message || `Ocurrió un error al ${actionText} al usuario`,
            'error'
          );
        }
      }
    });
  };

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: '¿Estás seguro de que quieres eliminar este usuario?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:4000/api/admin/users/${userId}`,
            { withCredentials: true }
          );
          Swal.fire(
            '¡Eliminado!',
            'El usuario ha sido eliminado.',
            'success'
          );
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user", error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response?.data?.message || "Ocurrió un error al eliminar el usuario",
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <span>←</span> Volver al Inicio
        </button>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Gestión de Usuarios
            </h1>
            <p className="text-zinc-500 mt-1">
              Control de la base de usuarios del gimnasio
            </p>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setErrors({});
            }}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            + Nuevo Usuario
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 font-medium">
                <tr>
                  <th className="px-6 py-4">Nombre del Usuario</th>
                  <th className="px-6 py-4">DNI (Usuario/Pass)</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Vencimiento de Licencia</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
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
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4">
                        {user.email ? user.email.split("@")[0] : "Sin DNI"}
                      </td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        {user.licenseEndDate
                          ? new Date(user.licenseEndDate)
                              .toISOString()
                              .split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            user.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {user.isActive ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-zinc-600 hover:text-zinc-900 font-medium px-2 py-1 text-xs bg-zinc-100 rounded-md transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleSuspendUser(user._id, user.isActive)}
                          className={`font-medium px-2 py-1 text-xs rounded-md transition-colors ${
                            user.isActive
                              ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                              : "text-blue-700 bg-blue-50 hover:bg-blue-100"
                          }`}
                        >
                          {user.isActive ? "Suspender" : "Activar"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 font-medium px-2 py-1 text-xs bg-red-50 rounded-md transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-900">
                  Registrar Usuario
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      errors.name ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    DNI (Servirá para ingresar)
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      errors.dni ? "border-red-500" : "border-zinc-200"
                    }`}
                  />
                  {errors.dni && (
                    <p className="text-red-500 text-xs mt-1">{errors.dni}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
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
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
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
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      errors.licenseStartDate
                        ? "border-red-500"
                        : "border-zinc-200"
                    }`}
                  />
                  {errors.licenseStartDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.licenseStartDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
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
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      errors.licenseEndDate
                        ? "border-red-500"
                        : "border-zinc-200"
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
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors mt-6"
                >
                  Crear Cuenta de Usuario
                </button>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-900">
                  Editar Licencia
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
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
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      editErrors.licenseStartDate
                        ? "border-red-500"
                        : "border-zinc-200"
                    }`}
                  />
                  {editErrors.licenseStartDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {editErrors.licenseStartDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
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
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      editErrors.licenseEndDate
                        ? "border-red-500"
                        : "border-zinc-200"
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
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors mt-6"
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