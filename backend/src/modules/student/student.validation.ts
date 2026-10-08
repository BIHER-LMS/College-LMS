import { z } from 'zod';

export const updateProfileSchema = z.object({
  phone: z.string().max(20, 'Phone must be at most 20 characters').nullable().optional(),
  address: z.string().max(255, 'Address must be at most 255 characters').nullable().optional(),
  city: z.string().max(100, 'City must be at most 100 characters').nullable().optional(),
  state: z.string().max(100, 'State must be at most 100 characters').nullable().optional(),
  profilePhotoUrl: z.string().url('Must be a valid URL').nullable().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be at most 500 characters').nullable().optional(),
}).strict({
  message: 'Modifying academic hierarchy, role, department, class, batch, or register number is strictly forbidden',
});
