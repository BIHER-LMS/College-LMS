import { z } from 'zod';

export const updateCollegeProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name is too long').optional(),
  type: z.string().optional().nullable(),
  domain: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  establishedYear: z
    .number()
    .int()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .nullable(),

  // Academic Information
  affiliatedUniversity: z.string().optional().nullable(),
  accreditation: z.string().optional().nullable(),
  naacGrade: z.string().optional().nullable(),
  recognition: z.string().optional().nullable(),
  institutionType: z.string().optional().nullable(),

  // Administration
  principalName: z.string().optional().nullable(),
  principalEmail: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  principalPhone: z.string().optional().nullable(),
  adminOfficeEmail: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  adminOfficePhone: z.string().optional().nullable(),

  // Online Presence
  linkedinUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  instagramUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  facebookUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  youtubeUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
}).strict();

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(150, 'Department name is too long'),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(20, 'Department code is too long').toUpperCase(),
  hod_uid: z.string().uuid('Invalid HOD UID').optional().nullable(),
  is_active: z.boolean().default(true),
}).strict();
