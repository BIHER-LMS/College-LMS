import { z } from 'zod';

/**
 * Roles that users are allowed to REQUEST during onboarding.
 * SUPER_ADMIN and SUPERINTENDENT cannot be self-assigned.
 */
export const SELF_ASSIGNABLE_ROLES = [
  'STUDENT',
  'FACULTY',
  'TRAINER',
  'HOD',
  'TPO',
  'COLLEGE_ADMIN',
] as const;

export const onboardingSchema = z.object({
  collegeId: z.string().uuid('Invalid college ID format'),
  requestedRole: z.enum(SELF_ASSIGNABLE_ROLES, {
    errorMap: () => ({ message: 'Invalid or restricted role' }),
  }),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10).max(15).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const logoutSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID').optional(),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20).optional().nullable(),
  displayName: z.string().max(128).optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
