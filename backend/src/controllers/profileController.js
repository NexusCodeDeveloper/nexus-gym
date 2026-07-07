import User from '../models/User.js';
import Routine from '../models/Routine.js';

export const updateMetrics = async (req, res) => {
  try {
    const { weight, height, prs } = req.body;
    
    // 1. Traemos el documento completo del usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Parche salvavidas: Si el usuario no tiene los arrays (ej: del Seeder), los creamos
    if (!Array.isArray(user.metrics.weightHistory)) {
      user.metrics.weightHistory = [];
    }
    if (!Array.isArray(user.metrics.prsHistory)) {
      user.metrics.prsHistory = [];
    }

    // 3. Modificamos los datos a mano
    user.metrics.height = height;
    user.metrics.weightHistory.push({ weight, date: new Date() });
    user.metrics.prsHistory.push({ ...prs, date: new Date() });

    // 4. Guardamos con .save() (Garantiza que se guarden en MongoDB sin fallar)
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error actualizando métricas:", error);
    res.status(500).json({ message: "Error al actualizar las métricas" });
  }
};

export const getStaffStats = async (req, res) => {
  try {
    const gymId = req.user.role === 'admin' ? req.user.id : req.user.createdBy;    
    const activeStudents = await User.countDocuments({ role: 'alumno', createdBy: gymId, isActive: true });
    const inactiveStudents = await User.countDocuments({ role: 'alumno', createdBy: gymId, isActive: false });
    
    const activeTeachers = await User.countDocuments({ role: 'profesor', createdBy: gymId, isActive: true });
    const inactiveTeachers = await User.countDocuments({ role: 'profesor', createdBy: gymId, isActive: false });
    
    const totalRoutines = await Routine.countDocuments({ gymId });

    res.status(200).json({
      activeStudents,
      inactiveStudents,
      activeTeachers,
      inactiveTeachers,
      totalRoutines,
      attendanceRate: 85 
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};