import { z } from 'zod';

export const createCollegeSchema = z.object({
  name: z.string().min(2).max(300),
  code: z.string().min(2).max(20).toUpperCase(),
  domain: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).default('India'),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

export type CreateCollegeInput = z.infer<typeof createCollegeSchema>;

export const updateCollegeSchema = createCollegeSchema.partial();
export type UpdateCollegeInput = z.infer<typeof updateCollegeSchema>;
