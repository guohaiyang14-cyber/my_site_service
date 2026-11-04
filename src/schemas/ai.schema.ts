import { z } from 'zod';

export const generateInfoSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(100),
  techStack: z.array(z.string().trim().min(1)).optional().default([]),
});
