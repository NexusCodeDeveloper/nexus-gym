import User from '../models/User.js';
import Routine from '../models/Routine.js';
import Attendance from '../models/Attendance.js';

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

    const today = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }) + 'T00:00:00.000Z');
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const gymProfessors = await User.find({
      createdBy: gymId,
      role: 'profesor',
      isActive: true,
    }).select('_id createdAt');

    const totalRecords = gymProfessors.length > 0
      ? await Attendance.countDocuments({
          userId: { $in: gymProfessors.map(u => u._id) },
          date: { $gte: thirtyDaysAgo },
        })
      : 0;

    const totalPossibleDays = gymProfessors.reduce((sum, prof) => {
      const daysSinceCreation = Math.ceil((today - prof.createdAt) / (24 * 60 * 60 * 1000));
      return sum + Math.min(30, Math.max(1, daysSinceCreation));
    }, 0);
    const attendanceRate = totalPossibleDays > 0
      ? Math.min(100, Math.round((totalRecords / totalPossibleDays) * 100))
      : 0;

    res.status(200).json({
      activeStudents,
      inactiveStudents,
      activeTeachers,
      inactiveTeachers,
      totalRoutines,
      attendanceRate,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};