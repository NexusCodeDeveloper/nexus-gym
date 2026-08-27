import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID inválido'),
});

export const mediaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100).optional(),
  description: z.string().max(300).optional(),
  category: z.string().max(50).optional(),
});