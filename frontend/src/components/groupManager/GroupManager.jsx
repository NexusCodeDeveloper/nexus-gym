import { useState, useEffect } from 'react';
import api from '../../service/api.js';
import { showSuccessToast, showErrorToast, showDeleteConfirmDialog } from '../../utils/swal';

const GroupManager = ({ open, onClose, students, onGroupsChanged }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', studentIds: [] });

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data?.data || []);
    } catch {
      showErrorToast('Error al cargar los grupos');
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      setEditingId(null);
      setForm({ name: '', studentIds: [] });
      fetchGroups().finally(() => setLoading(false));
    }
  }, [open]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', studentIds: [] });
  };

  const startEdit = (group) => {
    setEditingId(group._id);
    setForm({
      name: group.name,
      studentIds: group.students.map(s => s._id),
    });
  };

  const toggleStudent = (id) => {
    setForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter(s => s !== id)
        : [...prev.studentIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      return showErrorToast('Poné un nombre al grupo');
    }

    try {
      const payload = { name: form.name.trim(), students: form.studentIds };
      if (editingId) {
        await api.put(`/api/groups/${editingId}`, payload);
        showSuccessToast('Grupo actualizado');
      } else {
        await api.post('/api/groups', payload);
        showSuccessToast('Grupo creado');
      }
      resetForm();
      await fetchGroups();
      onGroupsChanged();
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Error al guardar el grupo');
    }
  };

  const handleDelete = async (group) => {
    const confirmed = await showDeleteConfirmDialog({
      title: '¿Eliminar grupo?',
      text: `"${group.name}" se desvinculará de las rutinas asignadas.`,
      confirmButtonText: 'Sí, eliminar',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/api/groups/${group._id}`);
      showSuccessToast('Grupo eliminado');
      if (editingId === group._id) resetForm();
      await fetchGroups();
      onGroupsChanged();
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Error al eliminar el grupo');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] flex flex-col border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-100">Grupos de alumnos</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col min-h-0">
            <p className="text-xs font-semibold text-zinc-400 mb-2">Grupos existentes</p>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <p className="text-center text-zinc-500 py-8 text-sm">Cargando...</p>
              ) : groups.length === 0 ? (
                <p className="text-center text-zinc-500 py-8 text-sm">Todavía no hay grupos. Creá el primero.</p>
              ) : (
                groups.map(group => (
                  <div key={group._id} className="bg-zinc-800 rounded-xl border border-zinc-700 p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-200 text-sm truncate">{group.name}</p>
                      <p className="text-[11px] text-zinc-500">{group.students.length} alumnos</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(group)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(group)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <p className="text-xs font-semibold text-zinc-400 mb-2">{editingId ? 'Editar grupo' : 'Nuevo grupo'}</p>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre del grupo (ej: Crossfit, Principiantes)"
              className="mb-3 p-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1 overflow-y-auto pr-1 mb-3">
              <p className="text-[11px] text-zinc-500 mb-2">Alumnos del grupo</p>
              {students.length === 0 ? (
                <p className="text-center text-zinc-500 py-6 text-sm">No hay alumnos disponibles.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {students.map(a => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => toggleStudent(a._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.studentIds.includes(a._id)
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {form.studentIds.includes(a._id) ? '✓ ' : ''}{a.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {editingId ? 'Guardar cambios' : 'Crear grupo'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupManager;