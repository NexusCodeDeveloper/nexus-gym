  import User from "../models/User.js";

  export const getUsers = async (req, res) => {
    try {
      const adminId = req.user.id;
      const users = await User.find({ createdBy: adminId });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  };

  export const updateUserLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const { licenseStartDate, licenseEndDate } = req.body;
    const adminId = req.user.id;

    const userToUpdate = await User.findById(id);

    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (userToUpdate.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: "No tienes permiso para actualizar este usuario" });
    }

    userToUpdate.licenseStartDate = licenseStartDate;
    userToUpdate.licenseEndDate = licenseEndDate;

    await userToUpdate.save();

    res.status(200).json({ message: "Licencia de usuario actualizada correctamente", user: userToUpdate });
  } catch (error) {
    console.error("Error al actualizar la licencia del usuario:", error);
    res.status(500).json({ message: "Error al actualizar la licencia del usuario" });
  }
  };

export const suspendStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const userToSuspend = await User.findById(id);

    if (!userToSuspend) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (userToSuspend.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: "No tienes permiso para suspender este usuario" });
    }

    userToSuspend.isActive = !userToSuspend.isActive;
    await userToSuspend.save();

    res.status(200).json({ message: "Estado de usuario actualizado correctamente", user: userToSuspend });
  } catch (error) {
    console.error("Error al suspender al usuario:", error);
    res.status(500).json({ message: "Error al suspender al usuario" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (userToDelete.createdBy.toString() !== adminId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este usuario" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar al usuario:", error);
    res.status(500).json({ message: "Error al eliminar al usuario" });
  }
};