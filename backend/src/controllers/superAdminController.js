import User from '../models/User.js';
import Routine from '../models/Routine.js';
import Group from '../models/Group.js';
import Attendance from '../models/Attendance.js';
import ExerciseMedia from '../models/ExerciseMedia.js';
import SecurityAlert from '../models/SecurityAlert.js';
import RoutineProgress from '../models/RoutineProgress.js';
import WorkoutSession from '../models/WorkoutSession.js';
import bcrypt from 'bcryptjs';
import { toArgDate, getArgToday, getArgStartOfDay } from '../utils/date.js';

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ message: 'Administradores obtenidos correctamente', data: admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error al obtener los administradores' });
  }
};

export const toggleAdminAccess = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.validatedParams.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({
      message: `Acceso ${admin.isActive ? 'activado' : 'suspendido'} correctamente`,
      data: { isActive: admin.isActive },
    });
  } catch (error) {
    console.error('Error toggling access:', error);
    res.status(500).json({ message: 'Error al actualizar el acceso' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, dni, licenseStartDate, licenseEndDate } = req.validatedBody;

    const existingUser = await User.findOne({ dni });
    if (existingUser) {
      return res.status(400).json({ message: 'El DNI ya se encuentra registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dni, salt);

    const newAdmin = await User.create({
      name,
      dni,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      licenseStartDate: toArgDate(licenseStartDate),
      licenseEndDate: toArgDate(licenseEndDate),
    });

    const { password, ...safeAdmin } = newAdmin.toObject();
    res.status(201).json({ message: 'Cliente creado correctamente', data: safeAdmin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error al crear el cliente' });
  }
};

export const renewAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.validatedParams.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const today = getArgToday();
    const currentEnd = admin.licenseEndDate
      ? getArgStartOfDay(admin.licenseEndDate)
      : new Date(0);

    const baseDate = currentEnd > today ? currentEnd : today;
    const newEnd = new Date(baseDate);
    newEnd.setMonth(newEnd.getMonth() + 1);

    if (newEnd.getDate() !== baseDate.getDate()) {
      newEnd.setDate(0);
    }

    admin.licenseEndDate = newEnd;
    admin.isActive = true;
    await admin.save();

    const { password, ...safeAdmin } = admin.toObject();
    res.json({ message: 'Licencia renovada correctamente', data: safeAdmin });
  } catch (error) {
    console.error('Error renewing:', error);
    res.status(500).json({ message: 'Error al renovar la licencia' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOneAndDelete({ _id: req.validatedParams.id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const gymId = admin._id;

    await Promise.all([
      User.deleteMany({ createdBy: gymId }),
      Routine.deleteMany({ gymId }),
      Group.deleteMany({ gymId }),
      Attendance.deleteMany({ gymId }),
      ExerciseMedia.deleteMany({ gymId }),
      SecurityAlert.deleteMany({ gymId }),
      RoutineProgress.deleteMany({ gymId }),
      WorkoutSession.deleteMany({ gymId }),
    ]);

    res.json({ message: 'Cliente y todos sus usuarios/rutinas eliminados correctamente' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ message: 'Error al eliminar el cliente' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const updateFields = req.validatedBody;
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    if (updateFields.licenseStartDate) {
      updateFields.licenseStartDate = toArgDate(updateFields.licenseStartDate);
    }
    if (updateFields.licenseEndDate) {
      updateFields.licenseEndDate = toArgDate(updateFields.licenseEndDate);
    }

    const updatedAdmin = await User.findOneAndUpdate(
      { _id: req.validatedParams.id, role: 'admin' },
      updateFields,
      { returnDocument: 'after' }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json({ message: 'Cliente actualizado correctamente', data: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Error al actualizar el cliente' });
  }
};
