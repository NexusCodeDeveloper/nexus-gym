import User from '../models/User.js';
import Routine from '../models/Routine.js';
import ExerciseMedia from '../models/ExerciseMedia.js';
import mongoose from 'mongoose';

const ROLE_PERMISSIONS = {
  alumno: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
  ],
  profesor: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
    'getTeacherStudents',
    'findStudentByName',
    'createRoutine',
    'addExerciseToRoutine',
    'deleteRoutine',
    'getExerciseLibrary',
  ],
  admin: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
    'getTeacherStudents',
    'findStudentByName',
    'createRoutine',
    'addExerciseToRoutine',
    'deleteRoutine',
    'getExerciseLibrary',
  ],
  superAdmin: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
    'getTeacherStudents',
    'findStudentByName',
    'createRoutine',
    'addExerciseToRoutine',
    'deleteRoutine',
    'getExerciseLibrary',
  ],
};

const tools = {
  getStudentRoutines: async (args) => {
    const routines = await Routine.find({ studentId: args.studentId }).lean();
    return routines.map(r => ({
      _id: r._id,
      title: r.title,
      level: r.level,
      days: r.days.map(d => ({
        dayName: d.dayName,
        exercises: d.exercises.map(e => ({
          name: e.name,
          series: e.sets,
          reps: e.reps,
          rest: e.rest,
          videoUrl: e.videoUrl,
        })),
      })),
    }));
  },

  getStudentProgress: async (args) => {
    const user = await User.findById(args.studentId).select('metrics name').lean();
    if (!user) return null;
    const wh = user.metrics?.weightHistory || [];
    const ph = user.metrics?.prsHistory || [];
    return {
      name: user.name,
      weightHistory: wh.slice(-10).map(e => ({ weight: e.weight, date: e.date })),
      prsHistory: ph.slice(-5).map(e => ({ squat: e.squat, benchPress: e.benchPress, deadlift: e.deadlift, date: e.date })),
      lastPr: ph.length ? ph[ph.length - 1] : null,
      lastWeight: wh.length ? wh[wh.length - 1] : null,
    };
  },

  getTodayRoutine: async (args) => {
    const todayName = new Date().toLocaleDateString('es-AR', { weekday: 'long' });
    const cap = todayName.charAt(0).toUpperCase() + todayName.slice(1);
    const routines = await Routine.find({ studentId: args.studentId }).lean();
    for (const r of routines) {
      const day = r.days.find(d => d.dayName === cap);
      if (day) {
        return {
          routineTitle: r.title,
          dayName: cap,
          exercises: day.exercises.map(e => ({
            name: e.name,
            series: e.sets,
            reps: e.reps,
            rest: e.rest,
          })),
        };
      }
    }
    return null;
  },

  getTeacherStudents: async (args) => {
    const students = await User.find({ createdBy: args.teacherId, role: 'alumno' })
      .select('name email isActive')
      .lean();
    return students.map(s => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      isActive: s.isActive,
    }));
  },

  getStudentInfo: async (args) => {
    const student = await User.findById(args.studentId)
      .select('name email role isActive licenseStartDate licenseEndDate')
      .lean();
    return student;
  },

  findStudentByName: async (args) => {
    const regex = new RegExp(args.name, 'i');
    const students = await User.find({
      createdBy: args.teacherId,
      role: 'alumno',
      name: regex,
    }).select('name email').lean();
    return students.map(s => ({ _id: s._id, name: s.name, email: s.email }));
  },

  createRoutine: async (args) => {
    const newRoutine = new Routine({
      title: args.title,
      level: args.level || 'Principiante',
      days: args.days || [],
      studentId: new mongoose.Types.ObjectId(args.studentId),
      teacherId: new mongoose.Types.ObjectId(args.teacherId),
      gymId: new mongoose.Types.ObjectId(args.gymId),
    });
    const saved = await newRoutine.save();
    return {
      _id: saved._id,
      title: saved.title,
      studentId: saved.studentId,
      daysCount: saved.days.length,
    };
  },

  addExerciseToRoutine: async (args) => {
    const routine = await Routine.findById(args.routineId);
    if (!routine) return { error: 'Rutina no encontrada' };

    const day = routine.days.find(d => d.dayName === args.dayName);
    if (!day) return { error: `Día "${args.dayName}" no encontrado en la rutina` };

    day.exercises.push({
      name: args.name,
      sets: args.series?.toString() || '',
      reps: args.reps?.toString() || '',
      rest: args.rest || '',
      videoUrl: args.videoUrl || '',
    });

    await routine.save();
    return { success: true, exercise: args.name, day: args.dayName };
  },

  updateStudentWeight: async (args) => {
    const student = await User.findById(args.studentId);
    if (!student) return { error: 'Alumno no encontrado' };

    if (!student.metrics) student.metrics = {};
    if (!student.metrics.weightHistory) student.metrics.weightHistory = [];

    student.metrics.weightHistory.push({
      weight: args.weight,
      date: new Date(),
    });

    await student.save();
    return { success: true, weight: args.weight, date: new Date() };
  },

  getRoutineDetail: async (args) => {
    const routine = await Routine.findById(args.routineId).lean();
    if (!routine) return { error: 'Rutina no encontrada' };

    return {
      _id: routine._id,
      title: routine.title,
      level: routine.level,
      days: routine.days.map(d => ({
        dayName: d.dayName,
        exercises: d.exercises.map(e => ({
          name: e.name,
          series: e.sets,
          reps: e.reps,
          rest: e.rest,
          videoUrl: e.videoUrl,
        })),
      })),
    };
  },

  getExerciseLibrary: async (args) => {
    const query = {};
    const orConditions = [
      { name: { $regex: args.query, $options: 'i' } },
      { category: { $regex: args.query, $options: 'i' } },
      { description: { $regex: args.query, $options: 'i' } },
    ];
    query.$or = orConditions;
    if (args.gymId) query.gymId = new mongoose.Types.ObjectId(args.gymId);

    const results = await ExerciseMedia.find(query)
      .select('name description category videoUrl')
      .limit(10)
      .lean();

    return results.map(e => ({
      _id: e._id,
      name: e.name,
      description: e.description,
      category: e.category,
      videoUrl: e.videoUrl,
    }));
  },

  deleteRoutine: async (args) => {
    const routine = await Routine.findById(args.routineId);
    if (!routine) return { error: 'Rutina no encontrada' };

    if (routine.teacherId?.toString() !== args.teacherId) {
      return { error: 'No tenés permiso para eliminar esta rutina' };
    }

    await Routine.findByIdAndDelete(args.routineId);
    return { success: true, deletedId: args.routineId };
  },
};

export const executeTool = async (toolName, args, userRole) => {
  const allowed = ROLE_PERMISSIONS[userRole];
  if (!allowed || !allowed.includes(toolName)) {
    return { error: `No tenés permiso para usar esta función (rol: ${userRole})` };
  }

  const fn = tools[toolName];
  if (!fn) throw new Error(`Tool '${toolName}' no encontrado`);
  return await fn(args);
};
