import Routine from "../models/Routine.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createRoutine = async (req, res) => {
  try {
    const { title, level, days, studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "Falta seleccionar el alumno" });

    let gymId;
    // Si es Admin, el gymId es su propio ID. Si es Profe, es el del gimnasio que lo creó.
    if (req.user.role === 'admin') {
        gymId = req.user.id;
    } else {
        const teacherFound = await User.findById(req.user.id);
        if (!teacherFound) return res.status(404).json({ message: "Profesor no encontrado" });
        gymId = teacherFound.createdBy;
    }

    const newRoutine = new Routine({
      title, level, days,
      studentId: new mongoose.Types.ObjectId(studentId),
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

    if (userRole === "superadmin") routines = await Routine.find();
    else if (userRole === "admin") routines = await Routine.find({ gymId: new mongoose.Types.ObjectId(userId) });
    else if (userRole === "profesor" || userRole === "prof") routines = await Routine.find({ teacherId: new mongoose.Types.ObjectId(userId) });
    else if (userRole === "alumno") routines = await Routine.find({ studentId: new mongoose.Types.ObjectId(userId) });

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
    const routine = await Routine.findById(req.params.id);
    if (!routine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar" });
  }
};

export const updateRoutine = async (req, res) => {
  try {
    const { title, level, days, studentId } = req.body;
    const updatedRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      { title, level, days, studentId },
      { new: true }
    );
    if (!updatedRoutine) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json(updatedRoutine);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar" });
  }
};