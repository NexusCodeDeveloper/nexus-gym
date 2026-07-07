import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showSuccessToast, showErrorToast, showDeleteConfirmDialog } from '../../../utils/swal';

const CATEGORIES = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Full Body', 'General'];

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');

  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    category: 'General',
    file: null,
  });

  const fetchVideos = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/exercise-media', { withCredentials: true });
      setVideos(res.data);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.name) {
      showErrorToast('Completá el nombre y seleccioná un video');
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('video', uploadData.file);
    formData.append('name', uploadData.name);
    formData.append('description', uploadData.description);
    formData.append('category', uploadData.category);

    try {
      await axios.post('http://localhost:4000/api/exercise-media/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccessToast('Video subido correctamente');
      setUploadData({ name: '', description: '', category: 'General', file: null });
      fetchVideos();
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Error al subir el video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showDeleteConfirmDialog({
      title: '¿Eliminar este video?',
      text: 'Se eliminará de la librería y de Cloudinary.',
    });
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:4000/api/exercise-media/${id}`, { withCredentials: true });
      showSuccessToast('Video eliminado');
      setVideos(videos.filter(v => v._id !== id));
    } catch (err) {
      showErrorToast('Error al eliminar el video');
    }
  };

  const filtered = videos.filter(v =>
    v.name.toLowerCase().includes(filter.toLowerCase()) ||
    v.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
          <span>←</span> Volver
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Librería de Ejercicios</h1>
            <p className="text-zinc-500 mt-1">Subí y gestioná videos de ejercicios para usar en las rutinas</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100">Subir nuevo video</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nombre del ejercicio"
              value={uploadData.name}
              onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
              className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {uploadData.file ? uploadData.file.name : 'Seleccionar video...'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
            />
            <button
              type="submit"
              disabled={uploading || !uploadData.file}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Subiendo...' : 'Subir video'}
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500 py-12">Cargando videos...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-zinc-500 py-12">No hay videos en la librería.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(video => (
              <div key={video._id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="relative aspect-video bg-zinc-800">
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-zinc-100">{video.name}</h3>
                      {video.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{video.description}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 whitespace-nowrap">
                      {video.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{new Date(video.createdAt).toLocaleDateString('es-AR')}</span>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
