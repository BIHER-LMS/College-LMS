import { z } from 'zod';

export const reviewApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    if (data.status === 'REJECTED' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] },
);

export type ReviewApprovalInput = z.infer<typeof reviewApprovalSchema>;

export const listApprovalsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListApprovalsQuery = z.infer<typeof listApprovalsQuerySchema>;
