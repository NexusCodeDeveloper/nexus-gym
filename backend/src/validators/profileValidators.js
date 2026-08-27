import { z } from 'zod';

export const updateMetricsSchema = z.object({
  weight: z.number().min(0).max(300, 'Peso inválido'),
  height: z.number().min(0).max(250, 'Altura inválida'),
  prs: z.object({
    squat: z.number().min(0).max(500).default(0),
    benchPress: z.number().min(0).max(500).default(0),
    deadlift: z.number().min(0).max(500).default(0),
  }).default({}),
});