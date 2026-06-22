  import User from "../models/User.js";

  export const createTeacher = async (req, res) => {
    try {
      const { name, dni } = req.body;
      const adminId = req.user.id; 

      const existingTeacher = await User.findOne({ dni });
      if (existingTeacher) return res.status(400).json({ message: "El DNI ya está registrado" });

      const newTeacher = new User({
        name,
        dni,
        password: dni,
        role: "profesor",
        createdBy: adminId
      });

      await newTeacher.save();
      res.status(201).json(newTeacher);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el profesor" });
    }
  };

  export const getTeachers = async (req, res) => {
    try {
      const adminId = req.user.id;
      const teachers = await User.find({ role: "profesor", createdBy: adminId });
      res.status(200).json(teachers);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener staff" });
    }
  };