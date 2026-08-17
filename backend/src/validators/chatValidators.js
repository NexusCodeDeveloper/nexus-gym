import { z } from 'zod';

export const messageSchema = z.object({
  message: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(2000, 'El mensaje no puede superar los 2000 caracteres'),
});
