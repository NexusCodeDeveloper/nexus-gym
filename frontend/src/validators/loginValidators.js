import { z } from 'zod';

export const loginSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, "El DNI debe contener entre 7 y 8 números.")
});