import { z } from 'zod';

export const createVaultDocumentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  category: z
    .enum(['policy', 'dress_code', 'handbook', 'exam', 'discipline', 'general'], {
      errorMap: () => ({
        message: 'Category must be one of: policy, dress_code, handbook, exam, discipline, general',
      }),
    })
    .default('policy'),
  audience: z
    .enum(['STUDENT', 'FACULTY', 'HOD', 'ALL'], {
      errorMap: () => ({ message: 'Audience must be one of: STUDENT, FACULTY, HOD, ALL' }),
    })
    .default('ALL'),
  content: z
    .string()
    .min(10, 'Document content must be at least 10 characters')
    .max(25000, 'Document content cannot exceed 25,000 characters'),
  departmentId: z.string().optional().nullable(),
  source: z.string().max(200).optional().nullable(),
});

export type CreateVaultDocumentInput = z.infer<typeof createVaultDocumentSchema>;
