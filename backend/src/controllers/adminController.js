import User from "../models/User.js";

// 1. CREAR PROFESOR
export const createTeacher = async (req, res) => {
  try {
    const { name, dni } = req.body;
    // req.user viene de tu middleware de validación de token
    const adminId = req.user.id; 

    const existingTeacher = await User.findOne({ dni });
    if (existingTeacher) return res.status(400).json({ message: "El DNI ya está registrado" });

    const newTeacher = new User({
      name,
      dni,
      password: dni, // DNI como pass inicial
      role: "profesor",
      createdBy: adminId // ¡Clave! Vinculamos este profe con el gimnasio
    });

    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el profesor" });
  }
};

// 2. LISTAR PROFESORES DEL GIMNASIO
export const getTeachers = async (req, res) => {
  try {
    const adminId = req.user.id;
    // Buscamos solo los que fueron creados por este gimnasio
    const teachers = await User.find({ role: "profesor", createdBy: adminId });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener staff" });
  }
};