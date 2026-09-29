import { describe, it, expect } from 'vitest';
import { onboardingSchema } from '../src/schemas/auth.schema';
import { updateProfileSchema } from '../src/schemas/profile.schema';
import { reviewApprovalSchema } from '../src/schemas/approval.schema';
import { createCollegeSchema } from '../src/schemas/college.schema';

describe('Zod Schemas — Auth', () => {
  it('should accept valid onboarding data', () => {
    const result = onboardingSchema.safeParse({
      collegeId: '550e8400-e29b-41d4-a716-446655440000',
      requestedRole: 'STUDENT',
    });
    expect(result.success).toBe(true);
  });

  it('should reject non-UUID college ID', () => {
    const result = onboardingSchema.safeParse({
      collegeId: 'not-a-uuid',
      requestedRole: 'STUDENT',
    });
    expect(result.success).toBe(false);
  });

  it('should reject SUPER_ADMIN role in onboarding', () => {
    const result = onboardingSchema.safeParse({
      collegeId: '550e8400-e29b-41d4-a716-446655440000',
      requestedRole: 'SUPER_ADMIN',
    });
    expect(result.success).toBe(false);
  });

  it('should reject SUPERINTENDENT role in onboarding', () => {
    const result = onboardingSchema.safeParse({
      collegeId: '550e8400-e29b-41d4-a716-446655440000',
      requestedRole: 'SUPERINTENDENT',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid self-assignable roles', () => {
    const validRoles = ['STUDENT', 'FACULTY', 'TRAINER', 'HOD', 'TPO', 'COLLEGE_ADMIN'];
    for (const role of validRoles) {
      const result = onboardingSchema.safeParse({
        collegeId: '550e8400-e29b-41d4-a716-446655440000',
        requestedRole: role,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('Zod Schemas — Profile', () => {
  it('should accept valid profile update', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'John',
      lastName: 'Doe',
      department: 'Computer Science',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty update (all fields optional)', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject too-long firstName', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid gender', () => {
    const result = updateProfileSchema.safeParse({
      gender: 'INVALID',
    });
    expect(result.success).toBe(false);
  });
});

describe('Zod Schemas — Approval', () => {
  it('should accept valid approval', () => {
    const result = reviewApprovalSchema.safeParse({
      status: 'APPROVED',
    });
    expect(result.success).toBe(true);
  });

  it('should require rejectionReason when rejecting', () => {
    const result = reviewApprovalSchema.safeParse({
      status: 'REJECTED',
    });
    expect(result.success).toBe(false);
  });

  it('should accept rejection with reason', () => {
    const result = reviewApprovalSchema.safeParse({
      status: 'REJECTED',
      rejectionReason: 'Incomplete documentation',
    });
    expect(result.success).toBe(true);
  });
});

describe('Zod Schemas — College', () => {
  it('should accept valid college', () => {
    const result = createCollegeSchema.safeParse({
      name: 'Test College',
      code: 'TC',
    });
    expect(result.success).toBe(true);
  });

  it('should reject too-short code', () => {
    const result = createCollegeSchema.safeParse({
      name: 'Test',
      code: 'T',
    });
    expect(result.success).toBe(false);
  });

  it('should uppercase the code', () => {
    const result = createCollegeSchema.safeParse({
      name: 'Test College',
      code: 'tc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('TC');
    }
  });
});
