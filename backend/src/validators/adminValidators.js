import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'ID inválido'),
});

export const userQuerySchema = z.object({
  role: z.enum(['admin', 'profesor', 'alumno']).optional(),
});

export const updateLicenseSchema = z.object({
  licenseStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido'),
  licenseEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD requerido'),
});
