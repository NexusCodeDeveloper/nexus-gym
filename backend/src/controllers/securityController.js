import SecurityAlert from "../models/SecurityAlert.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const MINUTES_BETWEEN_ALERTS = 5;

export const logScreenshot = async (req, res) => {
  try {
    if (req.user.role !== 'alumno') {
      return res.status(403).json({ message: "Solo alumnos están bajo seguimiento de capturas" });
    }

    const student = await User.findById(req.user.id).select('createdBy isActive');
    if (!student) return res.status(404).json({ message: "Alumno no encontrado" });

    const gymId = student.createdBy;
    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al alumno" });
    }

    const cutoff = new Date(Date.now() - MINUTES_BETWEEN_ALERTS * 60 * 1000);
    const recent = await SecurityAlert.findOne({
      studentId: req.user.id,
      createdAt: { $gte: cutoff },
    });

    if (recent) {
      return res.status(200).json({ message: "Alerta ya registrada recientemente", data: recent });
    }

    const alert = new SecurityAlert({
      studentId: toObjectId(req.user.id),
      gymId: toObjectId(gymId),
      type: 'screenshot',
    });

    const savedAlert = await alert.save();
    res.status(201).json({ message: "Alerta registrada", data: savedAlert });
  } catch (error) {
    console.error("Error logging screenshot alert:", error);
    res.status(500).json({ message: "Error al registrar la alerta" });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const gymId = req.user.role === 'admin'
      ? req.user.id
      : (await User.findById(req.user.id).select('createdBy'))?.createdBy?.toString();

    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al usuario" });
    }

    const all = req.query.all === '1';
    const filter = { gymId: toObjectId(gymId) };
    if (!all) filter.readBy = { $ne: req.user.id };

    const alerts = await SecurityAlert.find(filter)
      .sort({ createdAt: -1 })
      .limit(all ? 50 : 20)
      .populate('studentId', 'name dni');

    res.status(200).json({
      message: "Alertas obtenidas correctamente",
      data: alerts.map(a => ({
        _id: a._id,
        type: a.type,
        createdAt: a.createdAt,
        student: a.studentId ? { _id: a.studentId._id, name: a.studentId.name, dni: a.studentId.dni } : null,
        readBy: all ? a.readBy.map(r => r.toString()) : undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Error al obtener las alertas" });
  }
};

export const markAlertRead = async (req, res) => {
  try {
    const alert = await SecurityAlert.findById(req.validatedParams.id);
    if (!alert) {
      return res.status(404).json({ message: "Alerta no encontrada" });
    }

    const gymId = req.user.role === 'admin'
      ? req.user.id
      : (await User.findById(req.user.id).select('createdBy'))?.createdBy?.toString();

    if (!gymId || alert.gymId.toString() !== gymId) {
      return res.status(403).json({ message: "No tenés permisos para modificar esta alerta" });
    }

    if (alert.readBy.some(u => u.toString() === req.user.id)) {
      return res.status(200).json({ message: "Alerta ya leída" });
    }

    alert.readBy.push(toObjectId(req.user.id));
    await alert.save();

    res.status(200).json({ message: "Alerta marcada como leída" });
  } catch (error) {
    console.error("Error marking alert as read:", error);
    res.status(500).json({ message: "Error al marcar la alerta" });
  }
};