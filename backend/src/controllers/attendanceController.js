import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

function getArgentinaToday() {
  const now = new Date();
  const argStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  return new Date(argStr + 'T00:00:00.000Z');
}

function toArgISO(date) {
  const d = new Date(date);
  const offset = -3 * 60;
  const local = new Date(d.getTime() + offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

export const checkin = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const now = new Date();
    const today = getArgentinaToday();

    if (user.role !== 'profesor' && user.role !== 'alumno') {
      return res.status(400).json({ message: 'Solo profesores y alumnos pueden marcar asistencia' });
    }

    const gymId = user.createdBy;

    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Ya marcaste asistencia hoy' });
    }

    await Attendance.create({ userId, gymId, date: today, checkIn: now, role: user.role });

    res.json({ message: 'Asistencia marcada correctamente' });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ message: 'Error al marcar asistencia' });
  }
};

export const myAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getArgentinaToday();

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await Attendance.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    const checkedInToday = records.length > 0 && new Date(records[0].date).toDateString() === today.toDateString();
    const totalDays = records.length;

    const user = await User.findById(userId).select('createdAt');
    const daysSinceCreation = Math.ceil((today - user.createdAt) / (24 * 60 * 60 * 1000));
    const maxDays = Math.min(30, Math.max(1, daysSinceCreation));
    const percentage = Math.min(100, Math.round((totalDays / maxDays) * 100));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthDays = await Attendance.countDocuments({
      userId,
      date: { $gte: startOfMonth },
    });

    res.json({
      checkedInToday,
      totalDays,
      percentage,
      monthDays,
      records: records.slice(0, 30).map(r => ({
        date: r.date,
        present: true,
      })),
    });
  } catch (error) {
    console.error('My attendance error:', error);
    res.status(500).json({ message: 'Error al obtener asistencia' });
  }
};

export const gymAttendance = async (req, res) => {
  try {
    const gymId = req.user.role === 'admin' ? req.user.id : req.user.createdBy;
    const today = getArgentinaToday();

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Only professors — students are private
    const professors = await User.find({
      createdBy: gymId,
      role: 'profesor',
      isActive: true,
    }).select('name createdAt');

    const professorIds = professors.map(p => p._id);

    let professorAttendance = [];
    let attendanceRate = 0;

    if (professorIds.length > 0) {
      const records = await Attendance.find({
        userId: { $in: professorIds },
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 }).populate('userId', 'name');

      const totalRecords = records.length;
      const totalPossibleDays = professors.reduce((sum, prof) => {
        const daysSinceCreation = Math.ceil((today - prof.createdAt) / (24 * 60 * 60 * 1000));
        return sum + Math.min(30, Math.max(1, daysSinceCreation));
      }, 0);
      attendanceRate = totalPossibleDays > 0 ? Math.min(100, Math.round((totalRecords / totalPossibleDays) * 100)) : 0;

      const todayRecords = records.filter(r => new Date(r.date).toDateString() === today.toDateString());

      professorAttendance = professors.map(p => {
        const profRecords = records.filter(r => r.userId && r.userId._id.toString() === p._id.toString());
        const checkedInToday = profRecords.some(r => new Date(r.date).toDateString() === today.toDateString());
        return {
          _id: p._id,
          name: p.name,
          checkedInToday,
          totalDays: profRecords.length,
          lastCheckIn: checkedInToday ? profRecords.find(r => new Date(r.date).toDateString() === today.toDateString())?.checkIn || null : null,
        };
      });
    }

    const totalStudents = await User.countDocuments({ createdBy: gymId, role: 'alumno', isActive: true });

    res.json({
      attendanceRate,
      totalProfessors: professorIds.length,
      totalStudents,
      todayCheckIns: professorAttendance.filter(p => p.checkedInToday).length,
      professors: professorAttendance,
    });
  } catch (error) {
    console.error('Gym attendance error:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de asistencia' });
  }
};

export const gymAttendanceHistory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el admin del gimnasio puede ver la asistencia de profesores' });
    }
    const gymId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate + 'T00:00:00.000Z') : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate + 'T00:00:00.000Z') : new Date();
    end.setHours(23, 59, 59, 999);

    const professors = await User.find({
      createdBy: gymId,
      role: 'profesor',
      isActive: true,
    }).select('name createdAt').sort({ name: 1 });

    const professorIds = professors.map(p => p._id);

    let records = [];
    if (professorIds.length > 0) {
      records = await Attendance.find({
        userId: { $in: professorIds },
        date: { $gte: start, $lte: end },
      }).sort({ date: -1 }).populate('userId', 'name');
    }

    const totalDaysInRange = Math.ceil((end - start) / (24 * 60 * 60 * 1000));

    const attendanceByProfessor = professors.map(prof => {
      const profRecords = records.filter(r => r.userId && r.userId._id.toString() === prof._id.toString());
      const dailyCheckIns = {};
      profRecords.forEach(r => {
        const key = toArgISO(r.date);
        if (!dailyCheckIns[key]) {
          dailyCheckIns[key] = r.checkIn;
        }
      });
      const profStart = new Date(Math.max(prof.createdAt, start));
      const effectiveDays = Math.max(1, Math.ceil((end - profStart) / (24 * 60 * 60 * 1000)));
      return {
        _id: prof._id,
        name: prof.name,
        totalDays: profRecords.length,
        attendanceRate: effectiveDays > 0 ? Math.min(100, Math.round((profRecords.length / effectiveDays) * 100)) : 0,
        dailyCheckIns,
        lastCheckIn: profRecords.length > 0 ? profRecords[0].checkIn : null,
      };
    });

    res.json({
      startDate: start,
      endDate: end,
      totalProfessors: professorIds.length,
      totalDays: totalDaysInRange,
      professors: attendanceByProfessor,
    });
  } catch (error) {
    console.error('Gym attendance history error:', error);
    res.status(500).json({ message: 'Error al obtener historial de asistencia' });
  }
};
