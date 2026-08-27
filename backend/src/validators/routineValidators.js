import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID inválido'),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre del ejercicio es requerido').max(100),
  sets: z.string().max(20).optional(),
  reps: z.string().max(20).optional(),
  rest: z.string().max(20).optional(),
  videoUrl: z.string().max(500).optional(),
});

export const daySchema = z.object({
  dayName: z.string().min(1, 'El nombre del día es requerido').max(20),
  exercises: z.array(exerciseSchema).default([]),
});

export const createRoutineSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100),
  level: z.enum(['Principiante', 'Intermedio', 'Avanzado']).default('Principiante'),
  days: z.array(daySchema).min(1, 'La rutina debe tener al menos un día').max(7),
  students: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de alumno inválido')).default([]),
  groups: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de grupo inválido')).default([]),
  assignedToAll: z.boolean().default(false),
});

export const updateRoutineSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100).optional(),
  level: z.enum(['Principiante', 'Intermedio', 'Avanzado']).optional(),
  days: z.array(daySchema).min(1).max(7).optional(),
  students: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de alumno inválido')).optional(),
  groups: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de grupo inválido')).optional(),
  assignedToAll: z.boolean().optional(),
});