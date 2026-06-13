import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const StaffManagement = () => {
  return (
    <AdminLayout>
      {/* Cabecera de la sección */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Gestión de Staff</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Administra los roles, profesores y personal del sistema.
          </p>
        </div>
        
        {/* Botón para abrir el modal de crear (por ahora estático) */}
        <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
          + Nuevo Miembro
        </button>
      </div>

      {/* Contenedor temporal para la futura tabla */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-500 border-dashed">
        Aquí irá la tabla con el listado de profesores y el selector de roles.
      </div>
    </AdminLayout>
  );
};

export default StaffManagement;