import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID inválido'),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es requerido').max(50, 'El nombre no puede superar los 50 caracteres'),
  students: z.array(z.string().regex(objectIdRegex, 'ID de alumno inválido')).default([]),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es requerido').max(50, 'El nombre no puede superar los 50 caracteres').optional(),
  students: z.array(z.string().regex(objectIdRegex, 'ID de alumno inválido')).optional(),
});