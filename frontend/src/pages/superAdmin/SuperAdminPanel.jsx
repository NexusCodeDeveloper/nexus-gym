  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { z } from 'zod';

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const createSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 letras").max(50, "El nombre es muy largo"),
    dni: z.string().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números sin puntos"),
    licenseStartDate: z.string().min(1, "Seleccioná una fecha de inicio"),
    licenseEndDate: z.string().min(1, "Seleccioná una fecha de fin")
  }).superRefine((data, ctx) => {
    if (data.licenseStartDate && data.licenseEndDate) {
      const start = new Date(data.licenseStartDate + "T00:00:00");
      const end = new Date(data.licenseEndDate + "T00:00:00");

      if (start < getToday()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La fecha de inicio no puede ser en el pasado",
          path: ["licenseStartDate"]
        });
      }
      
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El fin debe ser posterior al inicio",
          path: ["licenseEndDate"]
        });
      }
    }
  });

  // 2. Esquema para EDITAR (permite fechas en el pasado, porque el cliente pudo empezar hace meses)
  const editSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 letras").max(50, "El nombre es muy largo"),
    licenseStartDate: z.string().min(1, "Seleccioná una fecha de inicio"),
    licenseEndDate: z.string().min(1, "Seleccioná una fecha de fin")
  }).superRefine((data, ctx) => {
    if (data.licenseStartDate && data.licenseEndDate) {
      const start = new Date(data.licenseStartDate + "T00:00:00");
      const end = new Date(data.licenseEndDate + "T00:00:00");
      
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El fin debe ser posterior al inicio",
          path: ["licenseEndDate"]
        });
      }
    }
  });

  // ==========================================
  // COMPONENTE PRINCIPAL
  // ==========================================
  const SuperAdminPanel = () => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [createFormData, setCreateFormData] = useState({ name: '', dni: '', licenseStartDate: '', licenseEndDate: '' });
    const [editingAdmin, setEditingAdmin] = useState(null);

    // Estados para atrapar los errores de Zod y mostrarlos en la UI
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    const fetchAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/super-admin/admins", { withCredentials: true });
        setAdmins(response.data);
      } catch (error) {
        console.error("Error fetching admins", error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchAdmins();
    }, []);

    // ACCIÓN 1: Crear Cliente (Con validación)
    const handleCreateAdmin = async (e) => {
      e.preventDefault();
      setCreateErrors({}); // Limpiamos errores previos

      // Validamos con Zod usando safeParse
      const result = createSchema.safeParse(createFormData);
      
      if (!result.success) {
        // Si falla, extraemos los mensajes y los guardamos en el estado
        const formattedErrors = result.error.format();
        setCreateErrors({
          name: formattedErrors.name?._errors[0],
          dni: formattedErrors.dni?._errors[0],
          licenseStartDate: formattedErrors.licenseStartDate?._errors[0],
          licenseEndDate: formattedErrors.licenseEndDate?._errors[0],
        });
        return; // Frenamos la ejecución acá, no hace la petición a Axios
      }

      try {
        await axios.post("http://localhost:4000/api/super-admin/admins", createFormData, { withCredentials: true });
        setIsCreateModalOpen(false);
        setCreateFormData({ name: '', dni: '', licenseStartDate: '', licenseEndDate: '' });
        fetchAdmins(); 
      } catch (error) {
        alert(error.response?.data?.message || "Ocurrió un error al crear el cliente");
      }
    };

    // ACCIÓN 2: Alternar Suspensión
    const handleToggleAccess = async (id) => {
      try {
        const response = await axios.patch(`http://localhost:4000/api/super-admin/admins/${id}/toggle-access`, {}, { withCredentials: true });
        setAdmins(admins.map(admin => admin._id === id ? { ...admin, isActive: response.data.isActive } : admin));
      } catch (error) {
        console.error("Error toggling access", error);
      }
    };

    // ACCIÓN 3: Renovar Licencia
    const handleRenewLicense = async (id) => {
      if (!window.confirm("¿Estás seguro de renovar la licencia por 1 mes más?")) return;
      try {
        await axios.patch(`http://localhost:4000/api/super-admin/admins/${id}/renew`, {}, { withCredentials: true });
        fetchAdmins(); 
      } catch (error) {
        alert("Error al renovar la licencia");
      }
    };

    // ACCIÓN 4: Eliminar Cliente
    const handleDeleteAdmin = async (id) => {
      if (!window.confirm("🚨 ¿Eliminar este cliente definitivamente?")) return;
      try {
        await axios.delete(`http://localhost:4000/api/super-admin/admins/${id}`, { withCredentials: true });
        setAdmins(admins.filter(admin => admin._id !== id));
      } catch (error) {
        alert("Error al eliminar el cliente");
      }
    };

    // ACCIÓN 5: Abrir Modal de Edición
    const openEditModal = (admin) => {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };
      setEditingAdmin({
        ...admin,
        licenseStartDate: formatDateForInput(admin.licenseStartDate),
        licenseEndDate: formatDateForInput(admin.licenseEndDate)
      });
      setEditErrors({});
      setIsEditModalOpen(true);
    };

    // ACCIÓN 6: Guardar cambios de Edición (Con validación)
    const handleUpdateAdmin = async (e) => {
      e.preventDefault();
      setEditErrors({});

      const result = editSchema.safeParse(editingAdmin);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        setEditErrors({
          name: formattedErrors.name?._errors[0],
          licenseStartDate: formattedErrors.licenseStartDate?._errors[0],
          licenseEndDate: formattedErrors.licenseEndDate?._errors[0],
        });
        return;
      }

      try {
        await axios.put(`http://localhost:4000/api/super-admin/admins/${editingAdmin._id}`, editingAdmin, { withCredentials: true });
        setIsEditModalOpen(false);
        setEditingAdmin(null);
        fetchAdmins();
      } catch (error) {
        alert("Error al actualizar los datos");
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return "Sin límite";
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-AR', options);
    };

    return (
      <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Nexus Control</h1>
              <p className="text-zinc-500 mt-1">Gestión global de licencias y clientes</p>
            </div>
            <button onClick={() => { setIsCreateModalOpen(true); setCreateErrors({}); }} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
              + Nuevo Cliente
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 font-medium">
                  <tr>
                    <th className="px-6 py-4">Gimnasio / Cliente</th>
                    <th className="px-6 py-4">DNI (Acceso)</th>
                    <th className="px-6 py-4">Inicio Licencia</th>
                    <th className="px-6 py-4">Fin Licencia</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoading ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-zinc-400">Cargando clientes...</td></tr>
                  ) : admins.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-zinc-400">No hay gimnasios registrados.</td></tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900">{admin.name}</td>
                        <td className="px-6 py-4">{admin.dni}</td>
                        <td className="px-6 py-4">{formatDate(admin.licenseStartDate)}</td>
                        <td className="px-6 py-4 font-medium">{formatDate(admin.licenseEndDate)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${admin.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {admin.isActive ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openEditModal(admin)} className="text-zinc-600 hover:text-zinc-900 font-medium px-2 py-1 text-xs bg-zinc-100 rounded-md transition-colors">Editar</button>
                          <button onClick={() => handleRenewLicense(admin._id)} className="text-green-700 hover:text-green-900 font-medium px-2 py-1 text-xs bg-green-50 rounded-md transition-colors">Renovar x mes</button>
                          <button onClick={() => handleToggleAccess(admin._id)} className={`font-medium px-2 py-1 text-xs rounded-md transition-colors ${admin.isActive ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-blue-700 bg-blue-50 hover:bg-blue-100'}`}>
                            {admin.isActive ? 'Suspender' : 'Activar'}
                          </button>
                          <button onClick={() => handleDeleteAdmin(admin._id)} className="text-red-600 hover:text-red-900 font-medium px-2 py-1 text-xs bg-red-50 rounded-md transition-colors">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL 1: CREAR CLIENTE */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-zinc-900">Registrar Cliente</h2>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre del Gimnasio</label>
                    <input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${createErrors.name ? 'border-red-500' : 'border-zinc-200'}`} />
                    {createErrors.name && <p className="text-red-500 text-xs mt-1">{createErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">DNI del Dueño</label>
                    <input type="text" value={createFormData.dni} onChange={(e) => setCreateFormData({...createFormData, dni: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${createErrors.dni ? 'border-red-500' : 'border-zinc-200'}`} />
                    {createErrors.dni && <p className="text-red-500 text-xs mt-1">{createErrors.dni}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Inicio Licencia</label>
                      <input type="date" value={createFormData.licenseStartDate} onChange={(e) => setCreateFormData({...createFormData, licenseStartDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm ${createErrors.licenseStartDate ? 'border-red-500' : 'border-zinc-200'}`} />
                      {createErrors.licenseStartDate && <p className="text-red-500 text-xs mt-1 leading-tight">{createErrors.licenseStartDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Fin Licencia</label>
                      <input type="date" value={createFormData.licenseEndDate} onChange={(e) => setCreateFormData({...createFormData, licenseEndDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm ${createErrors.licenseEndDate ? 'border-red-500' : 'border-zinc-200'}`} />
                      {createErrors.licenseEndDate && <p className="text-red-500 text-xs mt-1 leading-tight">{createErrors.licenseEndDate}</p>}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors mt-6">
                    Registrar e Iniciar Acceso
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: EDITAR CLIENTE */}
          {isEditModalOpen && editingAdmin && (
            <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-zinc-900">Editar Cliente</h2>
                  <button onClick={() => { setIsEditModalOpen(false); setEditingAdmin(null); }} className="text-zinc-400 hover:text-zinc-600">✕</button>
                </div>

                <form onSubmit={handleUpdateAdmin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre del Gimnasio</label>
                    <input type="text" value={editingAdmin.name} onChange={(e) => setEditingAdmin({...editingAdmin, name: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${editErrors.name ? 'border-red-500' : 'border-zinc-200'}`} />
                    {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">DNI (No editable)</label>
                    <input type="text" disabled value={editingAdmin.dni} className="w-full px-4 py-2 bg-zinc-100 border border-zinc-200 rounded-xl cursor-not-allowed text-zinc-400 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Inicio Licencia</label>
                      <input type="date" value={editingAdmin.licenseStartDate} onChange={(e) => setEditingAdmin({...editingAdmin, licenseStartDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm ${editErrors.licenseStartDate ? 'border-red-500' : 'border-zinc-200'}`} />
                      {editErrors.licenseStartDate && <p className="text-red-500 text-xs mt-1 leading-tight">{editErrors.licenseStartDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Fin Licencia</label>
                      <input type="date" value={editingAdmin.licenseEndDate} onChange={(e) => setEditingAdmin({...editingAdmin, licenseEndDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm ${editErrors.licenseEndDate ? 'border-red-500' : 'border-zinc-200'}`} />
                      {editErrors.licenseEndDate && <p className="text-red-500 text-xs mt-1 leading-tight">{editErrors.licenseEndDate}</p>}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors mt-6">
                    Guardar Cambios
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };

  export default SuperAdminPanel;