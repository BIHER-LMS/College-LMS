import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(200).optional(),
  phone: z.string().min(10).max(15).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  designation: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  employeeId: z.string().max(50).optional(),
  studentId: z.string().max(50).optional(),
  enrollmentYear: z.coerce.number().int().min(1900).max(2100).optional(),
  bio: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  linkedinUrl: z.string().url().optional(),
  profilePhotoUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
