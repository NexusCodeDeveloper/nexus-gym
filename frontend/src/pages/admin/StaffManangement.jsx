import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';

// ESQUEMA DE ZOD
const staffSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 letras").max(50, "El nombre es muy largo"),
  dni: z.string().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números sin puntos")
});

const StaffManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', dni: '' });
  const [errors, setErrors] = useState({});

  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/admin/staff", { withCredentials: true });
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setErrors({});

    // VALIDACIÓN CON ZOD
    const result = staffSchema.safeParse(formData);
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      setErrors({
        name: formattedErrors.name?._errors[0],
        dni: formattedErrors.dni?._errors[0],
      });
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/admin/staff", formData, { withCredentials: true });
      setIsModalOpen(false);
      setFormData({ name: '', dni: '' });
      fetchTeachers(); 
    } catch (error) {
      console.error("Error creating teacher", error);
      alert(error.response?.data?.message || "Ocurrió un error al crear el profesor");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Gestión de Staff</h1>
            <p className="text-zinc-500 mt-1">Administración de profesores y entrenadores</p>
          </div>
          <button onClick={() => { setIsModalOpen(true); setErrors({}); }} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm">
            + Nuevo Profesor
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 font-medium">
                <tr>
                  <th className="px-6 py-4">Nombre del Profesor</th>
                  <th className="px-6 py-4">DNI (Acceso)</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400">Cargando staff...</td></tr>
                ) : teachers.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-400">No hay profesores registrados aún.</td></tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900">{teacher.name}</td>
                      <td className="px-6 py-4">{teacher.dni}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-zinc-400 hover:text-zinc-900 font-medium transition-colors">Editar</button>
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
                <h2 className="text-xl font-bold text-zinc-900">Registrar Profesor</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>

              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${errors.name ? 'border-red-500' : 'border-zinc-200'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">DNI</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    className={`w-full px-4 py-2 bg-zinc-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 ${errors.dni ? 'border-red-500' : 'border-zinc-200'}`}
                  />
                  {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
                </div>

                <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors mt-6">
                  Crear Cuenta
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StaffManagement;