import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dniRegex = /^\d{7,8}$/;

export const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  dni: z.string().regex(dniRegex, 'El DNI debe tener 7 u 8 dígitos'),
  role: z.enum(['profesor', 'alumno']).optional(),
  createdBy: z.string().regex(objectIdRegex, 'ID inválido').optional(),
  licenseStartDate: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido').optional(),
  licenseEndDate: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido').optional(),
});

export const dniSchema = z.object({
  dni: z.string().regex(dniRegex, 'El DNI debe tener 7 u 8 dígitos'),
  gymId: z.string().regex(objectIdRegex, 'ID de gimnasio inválido').optional(),
});

export const alumnosQuerySchema = z.object({
  gymId: z.string().regex(objectIdRegex, 'ID de gimnasio inválido').optional(),
});