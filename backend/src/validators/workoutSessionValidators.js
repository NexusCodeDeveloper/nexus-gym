import { z } from 'zod';

export const startSessionSchema = z.object({
  routineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de rutina inválido').optional().nullable(),
});