import User from '../models/User.js';
import Routine from '../models/Routine.js';
import Attendance from '../models/Attendance.js';
import { getArgToday } from '../utils/date.js';

export const updateMetrics = async (req, res) => {
  try {
    const { weight, height, prs } = req.validatedBody;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!Array.isArray(user.metrics.weightHistory)) {
      user.metrics.weightHistory = [];
    }
    if (!Array.isArray(user.metrics.prsHistory)) {
      user.metrics.prsHistory = [];
    }

    user.metrics.height = height;
    user.metrics.weightHistory.push({ weight, date: new Date() });
    user.metrics.prsHistory.push({ ...prs, date: new Date() });

    const updatedUser = await user.save();

    res.status(200).json({ message: "Métricas actualizadas correctamente", data: updatedUser });
  } catch (error) {
    console.error("Error updating metrics:", error);
    res.status(500).json({ message: "Error al actualizar las métricas" });
  }
};

export const getStaffStats = async (req, res) => {
  try {
    const requester = await User.findById(req.user.id).select('createdBy role');
    if (!requester) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const gymId = requester.role === 'admin' ? requester._id : requester.createdBy;
    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al usuario" });
    }

    const activeStudents = await User.countDocuments({ role: 'alumno', createdBy: gymId, isActive: true });
    const inactiveStudents = await User.countDocuments({ role: 'alumno', createdBy: gymId, isActive: false });

    const activeTeachers = await User.countDocuments({ role: 'profesor', createdBy: gymId, isActive: true });
    const inactiveTeachers = await User.countDocuments({ role: 'profesor', createdBy: gymId, isActive: false });

    const totalRoutines = await Routine.countDocuments({ gymId });

    const today = getArgToday();
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
      message: "Estadísticas obtenidas correctamente",
      data: {
        activeStudents,
        inactiveStudents,
        activeTeachers,
        inactiveTeachers,
        totalRoutines,
        attendanceRate,
      },
    });
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};