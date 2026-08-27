import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID inválido'),
});

export const alertsQuerySchema = z.object({
  all: z.enum(['0', '1']).optional(),
});