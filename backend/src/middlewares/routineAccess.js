import Routine from '../models/Routine.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import mongoose from 'mongoose';

export const requireRoutineAccess = async (req, res, next) => {
  try {
    const { id, routineId } = req.params;
    const routineParam = id || routineId;

    if (!routineParam || !mongoose.Types.ObjectId.isValid(routineParam)) {
      return res.status(400).json({ message: 'ID de rutina inválido' });
    }

    const routine = await Routine.findById(routineParam);
    if (!routine) {
      return res.status(404).json({ message: 'Rutina no encontrada' });
    }

    const { role, id: userId } = req.user;
    let allowed = false;

    if (role === 'superAdmin') {
      allowed = true;
    } else if (role === 'admin') {
      allowed = routine.gymId.toString() === userId;
    } else if (role === 'profesor') {
      allowed = routine.teacherId.toString() === userId;
    } else if (role === 'alumno') {
      const isAssigned = routine.students.some(s => s.toString() === userId);
      if (isAssigned) {
        allowed = true;
      } else if (routine.assignedToAll) {
        const student = await User.findById(userId).select('createdBy').lean();
        allowed = !!student && routine.gymId.toString() === student.createdBy?.toString();
      } else if (routine.groups?.length) {
        const student = await User.findById(userId).select('createdBy').lean();
        if (student) {
          const myGroups = await Group.find({ gymId: student.createdBy, students: userId }).select('_id').lean();
          allowed = routine.groups.some(g =>
            myGroups.some(mg => mg._id.toString() === g.toString())
          );
        }
      }
    }

    if (!allowed) {
      return res.status(403).json({ message: 'No tenés permisos para acceder a esta rutina' });
    }

    req.routine = routine;
    next();
  } catch (error) {
    console.error('Error verificando acceso a rutina:', error);
    res.status(500).json({ message: 'Error al verificar el acceso a la rutina' });
  }
};