import Routine from "../models/Routine.js";
import mongoose from "mongoose";

export const createRoutine = async (req, res) => {
  try {
    const { title, level, days, studentId } = req.body;

    if (!studentId) {
        return res.status(400).json({ message: "Falta seleccionar el alumno" });
    }

    const newRoutine = new Routine({
      title,
      level,
      days,
      // Mantenemos el casteo a ObjectId que solucionó el problema
      studentId: new mongoose.Types.ObjectId(studentId),
      teacherId: new mongoose.Types.ObjectId(req.user.id),
    });

    const savedRoutine = await newRoutine.save();
    res.status(201).json(savedRoutine);

  } catch (error) {
    console.error("Error en createRoutine:", error);
    res.status(500).json({ message: "Error al guardar la rutina", error: error.message });
  }
};

export const getMyRoutines = async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase(); 
    const userId = req.user.id;
    
    let routines = [];

    if (userRole === "profesor" || userRole === "prof") {
      routines = await Routine.find({ teacherId: new mongoose.Types.ObjectId(userId) });
      
    } else if (userRole === "alumno") {
      routines = await Routine.find({ studentId: new mongoose.Types.ObjectId(userId) });
      
    } else {
      routines = await Routine.find();
    }

    res.status(200).json(routines);
    
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).json({ message: "Error fetching routines" });
  }
};