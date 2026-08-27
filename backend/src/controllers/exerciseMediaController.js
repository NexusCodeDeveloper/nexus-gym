import cloudinary from '../config/cloudinary.js';
import ExerciseMedia from '../models/ExerciseMedia.js';
import User from '../models/User.js';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se seleccionó ningún archivo' });
    }

    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ message: 'El archivo debe ser un video' });
    }

    const requester = await User.findById(req.user.id);
    if (!requester) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const gymId = requester.role === 'admin' ? requester._id : requester.createdBy;
    if (!gymId) {
      return res.status(400).json({ message: 'No se encontró el gimnasio asociado al usuario' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: `nexus-gym/${gymId}/exercises` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const media = new ExerciseMedia({
      name: req.validatedBody?.name || req.file.originalname,
      description: req.validatedBody?.description || '',
      category: req.validatedBody?.category || 'General',
      videoUrl: result.secure_url,
      publicId: result.public_id,
      gymId,
      uploadedBy: req.user.id,
    });

    await media.save();
    res.status(201).json({ message: 'Video subido correctamente', data: media });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error al subir el video' });
  }
};

export const listVideos = async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    if (!requester) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const filter = {};
    if (requester.role !== 'superAdmin') {
      const gymId = requester.role === 'admin' ? requester._id : requester.createdBy;
      if (!gymId) {
        return res.status(400).json({ message: 'No se encontró el gimnasio asociado al usuario' });
      }
      filter.gymId = gymId;
    }

    const videos = await ExerciseMedia.find(filter).sort({ createdAt: -1 });
    res.json({ message: 'Videos obtenidos correctamente', data: videos });
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ message: 'Error al obtener los videos' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const media = await ExerciseMedia.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    const requester = await User.findById(req.user.id);
    if (!requester) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (requester.role !== 'superAdmin' && media.gymId.toString() !== requester._id.toString() && media.gymId.toString() !== requester.createdBy?.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este video' });
    }

    await cloudinary.uploader.destroy(media.publicId, { resource_type: 'video' });
    await ExerciseMedia.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video eliminado correctamente', data: { id: req.params.id } });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Error al eliminar el video' });
  }
};
