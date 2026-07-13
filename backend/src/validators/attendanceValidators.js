import { z } from 'zod';

export const checkinSchema = z.object({
  source: z.enum(['manual', 'qr', 'nfc', 'api']).optional(),
});

export const checkoutSchema = z.object({});

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido').optional(),
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    req.validatedQuery = result.data;
    next();
  };
}
