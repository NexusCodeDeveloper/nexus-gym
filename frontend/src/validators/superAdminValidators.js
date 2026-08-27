import { z } from 'zod';

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const dateOrderRule = (data, ctx) => {
  if (data.licenseStartDate && data.licenseEndDate) {
    const start = new Date(data.licenseStartDate + "T00:00:00");
    const end = new Date(data.licenseEndDate + "T00:00:00");

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El fin debe ser posterior al inicio",
        path: ["licenseEndDate"],
      });
    }
  }
};

const createDateRule = (data, ctx) => {
  if (data.licenseStartDate) {
    const start = new Date(data.licenseStartDate + "T00:00:00");
    if (start < getToday()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de inicio no puede ser en el pasado",
        path: ["licenseStartDate"],
      });
    }
  }
  dateOrderRule(data, ctx);
};

export const createAdminSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 letras").max(50, "El nombre es muy largo"),
    dni: z.string().regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 números sin puntos"),
    licenseStartDate: z.string().min(1, "Seleccioná una fecha de inicio"),
    licenseEndDate: z.string().min(1, "Seleccioná una fecha de fin"),
  })
  .superRefine(createDateRule);

export const editAdminSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 letras").max(50, "El nombre es muy largo"),
    licenseStartDate: z.string().min(1, "Seleccioná una fecha de inicio"),
    licenseEndDate: z.string().min(1, "Seleccioná una fecha de fin"),
  })
  .superRefine(dateOrderRule);