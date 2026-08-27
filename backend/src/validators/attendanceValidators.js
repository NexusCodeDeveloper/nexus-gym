import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const checkinSchema = z.object({
  source: z.enum(['manual', 'qr', 'nfc', 'api']).optional(),
});

export const checkoutSchema = z.record(z.string(), z.unknown()).optional().default({});

export const dateRangeSchema = z.object({
  startDate: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido').optional(),
  endDate: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido').optional(),
  date: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido').optional(),
  gymId: z.string().regex(objectIdRegex, 'ID de gimnasio inválido').optional(),
});


