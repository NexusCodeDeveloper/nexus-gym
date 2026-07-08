import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Agregamos el hook de navegación
import axios from 'axios';
import { z } from 'zod';
import { showSuccessToast, showErrorToast, showConfirmDialog, showDeleteConfirmDialog, showPositiveConfirmDialog } from '../../utils/swal';

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

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openActionsId, setOpenActionsId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  
  const [searchDni, setSearchDni] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [createFormData, setCreateFormData] = useState({ name: '', dni: '', licenseStartDate: '', licenseEndDate: '' });
  const [editingAdmin, setEditingAdmin] = useState(null);

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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateErrors({});

    const result = createSchema.safeParse(createFormData);
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      setCreateErrors({
        name: formattedErrors.name?._errors[0],
        dni: formattedErrors.dni?._errors[0],
        licenseStartDate: formattedErrors.licenseStartDate?._errors[0],
        licenseEndDate: formattedErrors.licenseEndDate?._errors[0],
      });
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/super-admin/admins", createFormData, { withCredentials: true });
      setIsCreateModalOpen(false);
      showSuccessToast("Cliente creado y activado con éxito.");
      setCreateFormData({ name: '', dni: '', licenseStartDate: '', licenseEndDate: '' });
      fetchAdmins(); 
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Ocurrió un error al crear el cliente");
    }
  };

  const handleToggleChatbot = async (id) => {
    try {
      const res = await axios.patch(`http://localhost:4000/api/super-admin/admins/${id}/chatbot-toggle`, {}, { withCredentials: true });
      showSuccessToast(res.data.message);
      setAdmins(admins.map(a => a._id === id ? { ...a, chatbotEnabled: res.data.chatbotEnabled } : a));
    } catch (error) {
      showErrorToast('Error al cambiar estado del chatbot');
    }
  };

  const handleToggleAccess = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/super-admin/admins/${id}/toggle-access`, {}, { withCredentials: true });
      const actionText = response.data.isActive ? 'activado' : 'suspendido';
      showSuccessToast(`Acceso ${actionText} correctamente.`);
      setAdmins(admins.map(admin => admin._id === id ? { ...admin, isActive: response.data.isActive } : admin));
    } catch (error) {
      console.error("Error toggling access", error);
    }
  };

  const handleRenewLicense = async (id) => {
    const isConfirmed = await showPositiveConfirmDialog({
      title: '¿Renovar licencia?',
      text: 'Se extenderá la licencia del cliente por 1 mes más a partir de su fecha de vencimiento.',
      confirmButtonText: 'Sí, renovar'
    });

    if (!isConfirmed) return;

    try {
      await axios.patch(`http://localhost:4000/api/super-admin/admins/${id}/renew`, {}, { withCredentials: true });
      fetchAdmins(); 
      showSuccessToast("Licencia renovada con éxito");
    } catch (error) {
      showErrorToast("Error al renovar la licencia");
    }
  };

  const handleDeleteAdmin = async (id) => {
    const isConfirmed = await showDeleteConfirmDialog({
      title: '¿Eliminar este cliente?',
      text: 'Esta acción es definitiva. Se eliminarán el cliente y todos sus usuarios asociados.'
    });

    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:4000/api/super-admin/admins/${id}`, { withCredentials: true });
      setAdmins(admins.filter(admin => admin._id !== id));
      showSuccessToast("Cliente eliminado correctamente");
    } catch (error) {
      showErrorToast("Error al eliminar el cliente");
    }
  };

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
      showSuccessToast("Datos del cliente actualizados");
      fetchAdmins();
    } catch (error) {
      showErrorToast("Error al actualizar los datos");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin límite";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        <button 
          onClick={() => navigate('/')} 
          className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span>←</span> Volver al Inicio
        </button>

        {/* Encabezado */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Nexus Control</h1>
            <p className="text-zinc-400 mt-1">Gestión global de licencias y clientes</p>
          </div>
          <button onClick={() => { setIsCreateModalOpen(true); setCreateErrors({}); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors shadow-sm">
            + Nuevo Cliente
          </button>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm">
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
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-zinc-300 text-xs sm:text-sm">Cliente</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">Acceso</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">Inicio</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">Fin</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Estado</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Chatbot</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {isLoading ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-zinc-400">Cargando clientes...</td></tr>
                ) : admins.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-zinc-400">No hay gimnasios registrados.</td></tr>
                ) : (
                  admins.filter(admin => admin.dni && admin.dni.includes(searchDni)).map((admin) => (
                    <tr key={admin._id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-zinc-100 text-sm sm:text-base">{admin.name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">{admin.dni}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell">{formatDate(admin.licenseStartDate)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm table-cell font-medium">{formatDate(admin.licenseEndDate)}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${admin.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {admin.isActive ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => handleToggleChatbot(admin._id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium border transition-colors ${
                            admin.chatbotEnabled !== false
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {admin.chatbotEnabled !== false ? 'Habilitado' : 'Deshabilitado'}
                        </button>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                            setOpenActionsId(openActionsId === admin._id ? null : admin._id);
                          }}
                          className="text-zinc-400 hover:text-zinc-100 font-medium px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          Acciones ▾
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-100">Registrar Cliente</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre del Gimnasio</label>
                  <input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100 ${createErrors.name ? 'border-red-500' : 'border-zinc-700'}`} />
                  {createErrors.name && <p className="text-red-500 text-xs mt-1">{createErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">DNI del Dueño</label>
                  <input type="text" value={createFormData.dni} onChange={(e) => setCreateFormData({...createFormData, dni: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100 ${createErrors.dni ? 'border-red-500' : 'border-zinc-700'}`} />
                  {createErrors.dni && <p className="text-red-500 text-xs mt-1">{createErrors.dni}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Inicio Licencia</label>
                    <input type="date" value={createFormData.licenseStartDate} onChange={(e) => setCreateFormData({...createFormData, licenseStartDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-zinc-300 ${createErrors.licenseStartDate ? 'border-red-500' : 'border-zinc-700'}`} />
                    {createErrors.licenseStartDate && <p className="text-red-500 text-xs mt-1 leading-tight">{createErrors.licenseStartDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Fin Licencia</label>
                    <input type="date" value={createFormData.licenseEndDate} onChange={(e) => setCreateFormData({...createFormData, licenseEndDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-zinc-300 ${createErrors.licenseEndDate ? 'border-red-500' : 'border-zinc-700'}`} />
                    {createErrors.licenseEndDate && <p className="text-red-500 text-xs mt-1 leading-tight">{createErrors.licenseEndDate}</p>}
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors mt-6">
                  Registrar e Iniciar Acceso
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDITAR CLIENTE */}
        {isEditModalOpen && editingAdmin && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-100">Editar Cliente</h2>
                <button onClick={() => { setIsEditModalOpen(false); setEditingAdmin(null); }} className="text-zinc-500 hover:text-zinc-300">✕</button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre del Gimnasio</label>
                  <input type="text" value={editingAdmin.name} onChange={(e) => setEditingAdmin({...editingAdmin, name: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-100 ${editErrors.name ? 'border-red-500' : 'border-zinc-700'}`} />
                  {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">DNI (No editable)</label>
                  <input type="text" disabled value={editingAdmin.dni} className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-xl cursor-not-allowed text-zinc-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Inicio Licencia</label>
                    <input type="date" value={editingAdmin.licenseStartDate} onChange={(e) => setEditingAdmin({...editingAdmin, licenseStartDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-zinc-300 ${editErrors.licenseStartDate ? 'border-red-500' : 'border-zinc-700'}`} />
                    {editErrors.licenseStartDate && <p className="text-red-500 text-xs mt-1 leading-tight">{editErrors.licenseStartDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Fin Licencia</label>
                    <input type="date" value={editingAdmin.licenseEndDate} onChange={(e) => setEditingAdmin({...editingAdmin, licenseEndDate: e.target.value})} className={`w-full px-4 py-2 bg-zinc-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-zinc-300 ${editErrors.licenseEndDate ? 'border-red-500' : 'border-zinc-700'}`} />
                    {editErrors.licenseEndDate && <p className="text-red-500 text-xs mt-1 leading-tight">{editErrors.licenseEndDate}</p>}
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors mt-6">
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {openActionsId && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenActionsId(null)} />
          <div
            className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1.5 w-36"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {(() => {
              const admin = admins.find(a => a._id === openActionsId);
              if (!admin) return null;
              return (
                <>
                  <button onClick={() => { openEditModal(admin); setOpenActionsId(null); }} className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">Editar</button>
                  <button onClick={() => { handleRenewLicense(admin._id); setOpenActionsId(null); }} className="w-full text-left px-4 py-2 text-xs text-green-400 hover:bg-zinc-700 transition-colors">Renovar</button>
                  <button onClick={() => { handleToggleAccess(admin._id); setOpenActionsId(null); }} className={`w-full text-left px-4 py-2 text-xs transition-colors ${admin.isActive ? 'text-amber-400 hover:bg-zinc-700' : 'text-blue-400 hover:bg-zinc-700'}`}>
                    {admin.isActive ? 'Suspender' : 'Activar'}
                  </button>
                  <button onClick={() => { handleDeleteAdmin(admin._id); setOpenActionsId(null); }} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-zinc-700 transition-colors">Eliminar</button>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminPanel;
