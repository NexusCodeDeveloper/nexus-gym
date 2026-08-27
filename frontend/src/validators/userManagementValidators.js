import { z } from 'zod';

export const userSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 letras")
    .max(50, "El nombre es muy largo"),
  dni: z.string().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números sin puntos"),
  licenseStartDate: z.string().min(1, "La fecha de inicio es requerida"),
  licenseEndDate: z.string().min(1, "La fecha de fin es requerida"),
  role: z.string().min(1, "El rol es requerido"),
});

export const licenseSchema = z.object({
  licenseStartDate: z.string().min(1, "La fecha de inicio es requerida"),
  licenseEndDate: z.string().min(1, "La fecha de fin es requerida"),
});