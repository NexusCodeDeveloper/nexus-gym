import Routine from "../models/Routine.js";

export const createRoutine = async (req, res) => {
  try {
    const { title, level, days, studentId } = req.body;

    const newRoutine = new Routine({
      title,
      level,
      days,
      studentId, 
      teacherId: req.user.id, // ID del profesor sacado del token
    });

    const savedRoutine = await newRoutine.save();
    res.status(201).json(savedRoutine);
  } catch (error) {
    console.error("Error creating routine:", error);
    res.status(500).json({ message: "Error saving the routine", error: error.message });
  }
};

export const getMyRoutines = async (req, res) => {
  try {
    const userRole = req.user.role; 
    const userId = req.user.id;

    // 🔥 LOG PARA DEBUGEAR EN TU TERMINAL (VS Code)
    console.log(`🔍 Buscando rutinas para el usuario: ${userId} | Rol detectado: ${userRole}`);

    let routines;

    // Normalizamos el rol a minúsculas para evitar errores de case sensitive
    const normalizedRole = userRole?.toLowerCase();

    // LÓGICA DE BÚSQUEDA SEGÚN EL ROL
    if (normalizedRole === "profesor" || normalizedRole === "prof") {
      // Si es profe, trae las que él creó
      routines = await Routine.find({ teacherId: userId });
      
    } else if (normalizedRole === "alumno") {
      // Si es alumno, trae las que le asignaron a él
      routines = await Routine.find({ studentId: userId });
      
    } else {
      // Si es superAdmin, admin, o cualquier otro, trae todas
      routines = await Routine.find();
    }

    console.log(`✅ Rutinas encontradas y enviadas: ${routines.length}`);
    res.status(200).json(routines);
    
  } catch (error) {
    console.error("❌ Error fetching routines:", error);
    res.status(500).json({ message: "Error fetching routines" });
  }
};