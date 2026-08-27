import Group from "../models/Group.js";
import User from "../models/User.js";
import Routine from "../models/Routine.js";
import mongoose from "mongoose";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const resolveGymId = async (user) => {
  if (user.role === 'admin') return user.id;
  const teacher = await User.findById(user.id).select('createdBy');
  return teacher?.createdBy?.toString();
};

export const getGroups = async (req, res) => {
  try {
    const gymId = await resolveGymId(req.user);
    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al usuario" });
    }

    const groups = await Group.find({ gymId: toObjectId(gymId) }).populate('students', 'name isActive');
    res.status(200).json({ message: "Grupos obtenidos correctamente", data: groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Error al obtener los grupos" });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, students } = req.validatedBody;

    const gymId = await resolveGymId(req.user);
    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al usuario" });
    }

    if (students.length > 0) {
      const validStudents = await User.find({
        _id: { $in: students.map(toObjectId) },
        role: 'alumno',
        createdBy: toObjectId(gymId),
      }).select('_id');

      if (validStudents.length !== students.length) {
        return res.status(400).json({ message: "Alguno de los alumnos seleccionados no pertenece a tu gimnasio" });
      }
    }

    const newGroup = new Group({
      name,
      gymId: toObjectId(gymId),
      createdBy: toObjectId(req.user.id),
      students: students.map(toObjectId),
    });

    const savedGroup = await newGroup.save();
    res.status(201).json({ message: "Grupo creado correctamente", data: savedGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Error al crear el grupo" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, students } = req.validatedBody;
    const group = await Group.findById(req.validatedParams.id);

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const gymId = await resolveGymId(req.user);
    if (!gymId || group.gymId.toString() !== gymId) {
      return res.status(403).json({ message: "No tenés permisos para modificar este grupo" });
    }

    if (name !== undefined) group.name = name;

    if (students !== undefined) {
      if (students.length > 0) {
        const validStudents = await User.find({
          _id: { $in: students.map(toObjectId) },
          role: 'alumno',
          createdBy: toObjectId(gymId),
        }).select('_id');

        if (validStudents.length !== students.length) {
          return res.status(400).json({ message: "Alguno de los alumnos seleccionados no pertenece a tu gimnasio" });
        }
      }
      group.students = students.map(toObjectId);
    }

    await group.save();
    res.status(200).json({ message: "Grupo actualizado correctamente", data: group });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Error al actualizar el grupo" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.validatedParams.id);

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const gymId = await resolveGymId(req.user);
    if (!gymId || group.gymId.toString() !== gymId) {
      return res.status(403).json({ message: "No tenés permisos para eliminar este grupo" });
    }

    await Group.findByIdAndDelete(group._id);
    await Routine.updateMany({ gymId: group.gymId }, { $pull: { groups: group._id } });

    res.status(200).json({ message: "Grupo eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Error al eliminar el grupo" });
  }
};