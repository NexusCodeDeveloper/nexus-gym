import { z } from 'zod';

export const messageSchema = z.object({
  message: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(2000, 'El mensaje no puede superar los 2000 caracteres'),
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const messages = error.issues?.map((i) => i.message) || ['Datos inválidos'];
    return res.status(400).json({ message: messages.join(', ') });
  }
};
