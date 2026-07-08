import rateLimit from 'express-rate-limit';

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Demasiadas solicitudes. Esperá un momento antes de enviar otro mensaje.' },
  standardHeaders: true,
  legacyHeaders: false,
});
