import User from "../models/User.js";
import Group from "../models/Group.js";
import Routine from "../models/Routine.js";
import RoutineProgress from "../models/RoutineProgress.js";
import Attendance from "../models/Attendance.js";
import WorkoutSession from "../models/WorkoutSession.js";
import SecurityAlert from "../models/SecurityAlert.js";
import { toArgDate } from "../utils/date.js";

export const getUsers = async (req, res) => {
  try {
    const adminId = req.user.id;
    const filter = { createdBy: adminId };
    if (req.validatedQuery?.role) {
      filter.role = req.validatedQuery.role;
    }
    const users = await User.find(filter);
    res.status(200).json({ message: "Usuarios obtenidos correctamente", data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const updateUserLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const { licenseStartDate, licenseEndDate } = req.validatedBody;
    const adminId = req.user.id;

    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!userToUpdate.createdBy || userToUpdate.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este usuario" });
    }

    userToUpdate.licenseStartDate = toArgDate(licenseStartDate);
    userToUpdate.licenseEndDate = toArgDate(licenseEndDate);

    await userToUpdate.save();

    res.status(200).json({ message: "Licencia de usuario actualizada correctamente", data: userToUpdate });
  } catch (error) {
    console.error("Error updating user license:", error);
    res.status(500).json({ message: "Error al actualizar la licencia del usuario" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const userToSuspend = await User.findById(id);

    if (!userToSuspend) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!userToSuspend.createdBy || userToSuspend.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: "No tienes permiso para suspender este usuario" });
    }

    userToSuspend.isActive = !userToSuspend.isActive;
    await userToSuspend.save();

    res.status(200).json({ message: "Estado de usuario actualizado correctamente", data: userToSuspend });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ message: "Error al suspender al usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!userToDelete.createdBy || userToDelete.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este usuario" });
    }

    await Promise.all([
      User.findByIdAndDelete(id),
      Group.updateMany({ gymId: adminId }, { $pull: { students: id } }),
      Routine.updateMany({ gymId: adminId }, { $pull: { students: id } }),
      Routine.updateMany({ gymId: adminId, teacherId: id }, { teacherId: adminId }),
      RoutineProgress.deleteMany({ studentId: id }),
      Attendance.deleteMany({ userId: id }),
      WorkoutSession.deleteMany({ userId: id }),
      SecurityAlert.deleteMany({ studentId: id }),
    ]);

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error al eliminar al usuario" });
  }
};