import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'DISABLED']).optional(),
  role: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const changePasswordSchema = z.object({
  // The actual password change happens in Firebase.
  // This endpoint is for backend-side security record only.
  // No passwords are stored or sent through our backend.
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
