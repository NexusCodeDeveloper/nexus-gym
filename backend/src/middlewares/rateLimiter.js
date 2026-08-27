import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const checkinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Demasiados intentos. Esperá un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip, req),
});
