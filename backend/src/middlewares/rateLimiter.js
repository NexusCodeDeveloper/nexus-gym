import rateLimit from 'express-rate-limit';

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Demasiadas solicitudes. Esperá un momento antes de enviar otro mensaje.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos. Esperá un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});
