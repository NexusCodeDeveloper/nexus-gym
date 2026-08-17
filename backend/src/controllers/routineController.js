import Routine from "../models/Routine.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createRoutine = async (req, res) => {
  try {
    const { title, level, days, students, assignedToAll } = req.body;

    if (!assignedToAll && (!students || students.length === 0)) {
      return res.status(400).json({ message: "Seleccioná al menos un alumno o marcá 'Para todos'" });
    }

    let gymId;
    if (req.user.role === 'admin') {
      gymId = req.user.id;
    } else {
      const teacherFound = await User.findById(req.user.id);
      if (!teacherFound) return res.status(404).json({ message: "Profesor no encontrado" });
      gymId = teacherFound.createdBy;
    }

    if (assignedToAll) {
      const allStudents = await User.find({ createdBy: gymId, role: 'alumno', isActive: true }).select('_id');
      const newRoutine = new Routine({
        title, level, days,
        students: allStudents.map(s => s._id),
        assignedToAll: true,
        teacherId: new mongoose.Types.ObjectId(req.user.id),
        gymId: new mongoose.Types.ObjectId(gymId)
      });
      const savedRoutine = await newRoutine.save();
      return res.status(201).json(savedRoutine);
    }

    const newRoutine = new Routine({
      title, level, days,
      students: students.map(s => new mongoose.Types.ObjectId(s)),
      assignedToAll: false,
      teacherId: new mongoose.Types.ObjectId(req.user.id),
      gymId: new mongoose.Types.ObjectId(gymId)
    });

    const savedRoutine = await newRoutine.save();
    res.status(201).json(savedRoutine);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar", error: error.message });
  }
};

export const getMyRoutines = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user.id;
    let routines = [];

    if (userRole === "superadmin") routines = await Routine.find().populate('students', 'name');
    else if (userRole === "admin") routines = await Routine.find({ gymId: new mongoose.Types.ObjectId(userId) }).populate('students', 'name');
    else if (userRole === "profesor" || userRole === "prof") routines = await Routine.find({ teacherId: new mongoose.Types.ObjectId(userId) }).populate('students', 'name');
    else if (userRole === "alumno") {
      const user = await User.findById(userId).select('createdBy');
      routines = await Routine.find({
        $or: [
          { students: new mongoose.Types.ObjectId(userId) },
          { assignedToAll: true, gymId: user.createdBy }
        ]
      }).populate('students', 'name');
    }

    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching routines" });
  }
};

export const deleteRoutine = async (req, res) => {
  try {
    const deletedRoutine = await Routine.findByIdAndDelete(req.params.id);
    if (!deletedRoutine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json({ message: "Eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
};

export const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id).populate('students', 'name');
    if (!routine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar" });
  }
};

export const updateRoutine = async (req, res) => {
  try {
    const { title, level, days, students, assignedToAll } = req.body;
    const updateData = { title, level, days };

    if (assignedToAll) {
      const routine = await Routine.findById(req.params.id);
      if (!routine) return res.status(404).json({ message: "No encontrada" });
      const allStudents = await User.find({ createdBy: routine.gymId, role: 'alumno', isActive: true }).select('_id');
      updateData.students = allStudents.map(s => s._id);
      updateData.assignedToAll = true;
    } else if (students && students.length > 0) {
      updateData.students = students.map(s => new mongoose.Types.ObjectId(s));
      updateData.assignedToAll = false;
    }

    const updatedRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedRoutine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json(updatedRoutine);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};