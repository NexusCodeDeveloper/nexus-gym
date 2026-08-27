import Routine from "../models/Routine.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import mongoose from "mongoose";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const validateGroupOwnership = async (groupIds, gymId) => {
  const groups = await Group.find({ _id: { $in: groupIds.map(toObjectId) }, gymId: toObjectId(gymId) }).select('_id');
  return groups.length === groupIds.length;
};

const validateStudentOwnership = async (studentIds, gymId) => {
  if (studentIds.length === 0) return true;
  const students = await User.find({
    _id: { $in: studentIds.map(toObjectId) },
    role: 'alumno',
    createdBy: toObjectId(gymId),
  }).select('_id');
  return students.length === studentIds.length;
};

export const createRoutine = async (req, res) => {
  try {
    const { title, level, days, students, assignedToAll, groups } = req.validatedBody;

    if (!assignedToAll && students.length === 0 && groups.length === 0) {
      return res.status(400).json({ message: "Seleccioná al menos un alumno, un grupo o marcá 'Para todos'" });
    }

    let gymId;
    if (req.user.role === 'admin') {
      gymId = req.user.id;
    } else {
      const teacherFound = await User.findById(req.user.id);
      if (!teacherFound) return res.status(404).json({ message: "Profesor no encontrado" });
      gymId = teacherFound.createdBy;
    }

    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al usuario" });
    }

    if (groups.length > 0 && !(await validateGroupOwnership(groups, gymId))) {
      return res.status(400).json({ message: "Alguno de los grupos seleccionados no pertenece a tu gimnasio" });
    }

    if (!assignedToAll && students.length > 0 && !(await validateStudentOwnership(students, gymId))) {
      return res.status(400).json({ message: "Alguno de los alumnos seleccionados no pertenece a tu gimnasio" });
    }

    const studentIds = assignedToAll
      ? (await User.find({ createdBy: gymId, role: 'alumno', isActive: true }).select('_id')).map(s => s._id)
      : students.map(toObjectId);

    const newRoutine = new Routine({
      title,
      level,
      days,
      students: studentIds,
      groups: assignedToAll ? [] : groups.map(toObjectId),
      assignedToAll: !!assignedToAll,
      teacherId: toObjectId(req.user.id),
      gymId: toObjectId(gymId),
    });

    const savedRoutine = await newRoutine.save();
    res.status(201).json({ message: "Rutina creada correctamente", data: savedRoutine });
  } catch (error) {
    console.error("Error creating routine:", error);
    res.status(500).json({ message: "Error al guardar" });
  }
};

export const getMyRoutines = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user.id;
    let routines = [];

    if (userRole === "superadmin") routines = await Routine.find().populate('students', 'name').populate('groups', 'name');
    else if (userRole === "admin") routines = await Routine.find({ gymId: toObjectId(userId) }).populate('students', 'name').populate('groups', 'name');
    else if (userRole === "profesor" || userRole === "prof") routines = await Routine.find({ teacherId: toObjectId(userId) }).populate('students', 'name').populate('groups', 'name');
    else if (userRole === "alumno") {
      const user = await User.findById(userId).select('createdBy');
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }
      const myGroups = await Group.find({ gymId: user.createdBy, students: toObjectId(userId) }).select('_id');
      routines = await Routine.find({
        $or: [
          { students: toObjectId(userId) },
          { assignedToAll: true, gymId: user.createdBy },
          { groups: { $in: myGroups.map(g => g._id) } },
        ]
      }).populate('students', 'name');
    }

    res.status(200).json({ message: "Rutinas obtenidas correctamente", data: routines });
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).json({ message: "Error fetching routines" });
  }
};

export const deleteRoutine = async (req, res) => {
  try {
    const deletedRoutine = await Routine.findByIdAndDelete(req.params.id);
    if (!deletedRoutine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json({ message: "Rutina eliminada correctamente", data: { id: req.params.id } });
  } catch (error) {
    console.error("Error deleting routine:", error);
    res.status(500).json({ message: "Error al eliminar" });
  }
};

export const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate('students', 'name').populate('groups', 'name');
    if (!routine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json({ message: "Rutina obtenida correctamente", data: routine });
  } catch (error) {
    console.error("Error loading routine:", error);
    res.status(500).json({ message: "Error al cargar" });
  }
};

export const updateRoutine = async (req, res) => {
  try {
    const { title, level, days, students, assignedToAll, groups } = req.validatedBody;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (level !== undefined) updateData.level = level;
    if (days !== undefined) updateData.days = days;

    if (assignedToAll) {
      const allStudents = await User.find({ createdBy: req.routine.gymId, role: 'alumno', isActive: true }).select('_id');
      updateData.students = allStudents.map(s => s._id);
      updateData.groups = [];
      updateData.assignedToAll = true;
    } else if (assignedToAll === false) {
      const nextStudents = (students || []).map(toObjectId);
      const nextGroups = (groups || []).map(toObjectId);
      if (nextStudents.length === 0 && nextGroups.length === 0) {
        return res.status(400).json({ message: "Seleccioná al menos un alumno o un grupo" });
      }
      if (nextGroups.length > 0 && !(await validateGroupOwnership(nextGroups.map(g => g.toString()), req.routine.gymId))) {
        return res.status(400).json({ message: "Alguno de los grupos seleccionados no pertenece a tu gimnasio" });
      }
      if (nextStudents.length > 0 && !(await validateStudentOwnership(nextStudents.map(s => s.toString()), req.routine.gymId))) {
        return res.status(400).json({ message: "Alguno de los alumnos seleccionados no pertenece a tu gimnasio" });
      }
      updateData.students = nextStudents;
      updateData.groups = nextGroups;
      updateData.assignedToAll = false;
    } else if (groups !== undefined) {
      if (!(await validateGroupOwnership(groups, req.routine.gymId))) {
        return res.status(400).json({ message: "Alguno de los grupos seleccionados no pertenece a tu gimnasio" });
      }
      updateData.groups = groups.map(toObjectId);
    }

    const updatedRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );
    if (!updatedRoutine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json({ message: "Rutina actualizada correctamente", data: updatedRoutine });
  } catch (error) {
    console.error("Error updating routine:", error);
    res.status(500).json({ message: "Error al actualizar" });
  }
};