import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const ARG_OFFSET = -3 * 60;

function getArgDateInfo() {
  const now = new Date();
  const argMs = now.getTime() + ARG_OFFSET * 60 * 1000;
  const argDate = new Date(argMs);
  return {
    argDate,
    year: argDate.getUTCFullYear(),
    month: argDate.getUTCMonth(),
    day: argDate.getUTCDate(),
    hours: argDate.getUTCHours(),
    minutes: argDate.getUTCMinutes(),
  };
}

function getArgentinaToday() {
  const { year, month, day } = getArgDateInfo();
  return new Date(Date.UTC(year, month, day));
}

function getArgStartOfMonth() {
  const { year, month } = getArgDateInfo();
  return new Date(Date.UTC(year, month, 1));
}

function toArgISODate(date) {
  const d = new Date(date);
  const local = new Date(d.getTime() + ARG_OFFSET * 60 * 1000);
  return local.toISOString().split('T')[0];
}

function toArgDateOnly(date) {
  const d = new Date(date);
  const local = new Date(d.getTime() + ARG_OFFSET * 60 * 1000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

function calcMaxDays(userCreatedAt, today) {
  const created = new Date(userCreatedAt);
  const diffMs = today.getTime() - created.getTime();
  const daysSince = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  return Math.min(30, daysSince);
}

function calcPercentage(totalDays, maxDays) {
  return Math.min(100, Math.round((totalDays / maxDays) * 100));
}

export const checkin = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role !== 'profesor' && user.role !== 'alumno') {
      return res.status(403).json({ message: 'Solo profesores y alumnos pueden marcar asistencia' });
    }

    const gymId = user.createdBy;
    if (!gymId) {
      return res.status(400).json({ message: 'No se encontró el gimnasio asociado al usuario' });
    }

    const today = getArgentinaToday();
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Ya marcaste asistencia hoy' });
    }

    const source = req.validatedBody?.source || 'manual';

    await Attendance.create({
      userId,
      gymId,
      date: today,
      checkIn: new Date(),
      role: user.role,
      source,
    });

    res.json({ message: 'Asistencia marcada correctamente' });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ message: 'Error al marcar asistencia' });
  }
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role !== 'profesor' && user.role !== 'alumno') {
      return res.status(403).json({ message: 'Solo profesores y alumnos pueden marcar salida' });
    }

    const today = getArgentinaToday();

    const record = await Attendance.findOne({ userId, date: today });

    if (!record) {
      return res.status(400).json({ message: 'No registraste entrada hoy' });
    }

    if (record.checkOut) {
      return res.status(400).json({ message: 'Ya marcaste salida hoy' });
    }

    record.checkOut = new Date();
    await record.save();

    const durationMs = record.checkOut.getTime() - record.checkIn.getTime();
    const durationMin = Math.round(durationMs / 60000);

    res.json({
      message: 'Salida marcada correctamente',
      data: {
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        durationMin,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Error al marcar salida' });
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
    }).sort({ date: -1 }).select('date checkIn checkOut source');

    const checkedInToday = records.length > 0 && records[0].date.getTime() === today.getTime();
    const totalDays = records.length;

    const user = await User.findById(userId).select('createdAt');
    const maxDays = calcMaxDays(user.createdAt, today);
    const percentage = calcPercentage(totalDays, maxDays);

    const startOfMonth = getArgStartOfMonth();
    const monthDays = await Attendance.countDocuments({
      userId,
      date: { $gte: startOfMonth },
    });

    res.json({
      checkedInToday,
      totalDays,
      percentage,
      monthDays,
      hasCheckedOut: checkedInToday
        ? records.some(r => r.date.getTime() === today.getTime() && r.checkOut)
        : false,
      records: records.map(r => ({
        date: r.date,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        source: r.source,
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
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Solo el admin del gimnasio puede ver estas estadísticas' });
    }

    const gymId = req.user.role === 'superAdmin'
      ? (req.query.gymId || req.user.id)
      : req.user.id;

    const queryDate = req.validatedQuery?.date;
    const today = queryDate
      ? new Date(Date.UTC(
          parseInt(queryDate.split('-')[0]),
          parseInt(queryDate.split('-')[1]) - 1,
          parseInt(queryDate.split('-')[2])
        ))
      : getArgentinaToday();

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const professors = await User.find({
      createdBy: gymId,
      role: 'profesor',
    }).select('name dni createdAt isActive');

    const professorIds = professors.map(p => p._id);

    let professorAttendance = [];
    let attendanceRate = 0;

    if (professorIds.length > 0) {
      const records = await Attendance.find({
        userId: { $in: professorIds },
        date: { $gte: thirtyDaysAgo },
      }).sort({ date: -1 }).populate('userId', 'name');

      const totalPossibleDays = professors.reduce((sum, prof) => {
        if (!prof.isActive) return sum;
        return sum + calcMaxDays(prof.createdAt, today);
      }, 0);

      const totalRecords = records.length;
      attendanceRate = totalPossibleDays > 0
        ? Math.min(100, Math.round((totalRecords / totalPossibleDays) * 100))
        : 0;

      professorAttendance = professors.map(p => {
        const profRecords = records.filter(
          r => r.userId && r.userId._id.toString() === p._id.toString()
        );
        const checkedInToday = profRecords.some(
          r => toArgDateOnly(r.date).getTime() === today.getTime()
        );
        const todayRecord = profRecords.find(
          r => toArgDateOnly(r.date).getTime() === today.getTime()
        );
        return {
          _id: p._id,
          name: p.name,
          dni: p.dni,
          isActive: p.isActive,
          checkedInToday,
          totalDays: profRecords.length,
          lastCheckIn: todayRecord?.checkIn ?? null,
          lastCheckOut: todayRecord?.checkOut ?? null,
        };
      });
    }

    const totalStudents = await User.countDocuments({
      createdBy: gymId,
      role: 'alumno',
      isActive: true,
    });

    const totalActiveProfessors = professors.filter(p => p.isActive).length;

    res.json({
      attendanceRate,
      totalProfessors: totalActiveProfessors,
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
    if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Solo el admin del gimnasio puede ver esta información' });
    }

    const gymId = req.user.role === 'superAdmin'
      ? req.query.gymId
      : req.user.id;

    if (!gymId) {
      return res.status(400).json({ message: 'ID del gimnasio requerido' });
    }

    const { startDate, endDate } = req.validatedQuery;

    const today = getArgentinaToday();
    const defaultStart = new Date(today);
    defaultStart.setDate(defaultStart.getDate() - 30);

    const start = startDate
      ? new Date(Date.UTC(
          parseInt(startDate.split('-')[0]),
          parseInt(startDate.split('-')[1]) - 1,
          parseInt(startDate.split('-')[2])
        ))
      : defaultStart;

    const end = endDate
      ? new Date(Date.UTC(
          parseInt(endDate.split('-')[0]),
          parseInt(endDate.split('-')[1]) - 1,
          parseInt(endDate.split('-')[2]),
          23, 59, 59, 999
        ))
      : new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

    const rangeDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    if (rangeDays > 365) {
      return res.status(400).json({ message: 'El rango de fechas no puede superar los 365 días' });
    }

    const professors = await User.find({
      createdBy: gymId,
      role: 'profesor',
    }).select('name createdAt isActive').sort({ name: 1 });

    const professorIds = professors.map(p => p._id);

    let records = [];
    if (professorIds.length > 0) {
      records = await Attendance.find({
        userId: { $in: professorIds },
        date: { $gte: start, $lte: end },
      }).sort({ date: -1 }).populate('userId', 'name');
    }

    const rangeMs = end.getTime() - start.getTime();
    const totalDaysInRange = Math.max(1, Math.round(rangeMs / (24 * 60 * 60 * 1000)));

    const attendanceByProfessor = professors.map(prof => {
      const profRecords = records.filter(
        r => r.userId && r.userId._id.toString() === prof._id.toString()
      );
      const dailyCheckIns = {};
      profRecords.forEach(r => {
        const key = toArgISODate(r.date);
        if (!dailyCheckIns[key]) {
          dailyCheckIns[key] = {
            checkIn: r.checkIn,
            checkOut: r.checkOut,
          };
        }
      });

      const profStart = new Date(Math.max(prof.createdAt.getTime(), start.getTime()));
      const effectiveMs = end.getTime() - profStart.getTime();
      const effectiveDays = Math.max(1, Math.round(effectiveMs / (24 * 60 * 60 * 1000)));

      return {
        _id: prof._id,
        name: prof.name,
        isActive: prof.isActive,
        totalDays: profRecords.length,
        attendanceRate: effectiveDays > 0
          ? Math.min(100, Math.round((profRecords.length / effectiveDays) * 100))
          : 0,
        dailyCheckIns,
        lastCheckIn: profRecords.length > 0 ? profRecords[0].checkIn : null,
        lastCheckOut: profRecords.length > 0 ? profRecords[0].checkOut : null,
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
