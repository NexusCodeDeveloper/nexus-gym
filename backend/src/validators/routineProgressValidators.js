import { z } from 'zod';

export const idParamSchema = z.object({
  routineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
});

export const dayProgressSchema = z.object({
  dayIndex: z.number().int().min(0, 'Índice de día inválido').max(6),
  completedExercises: z.array(z.number().int().min(0)).default([]),
});