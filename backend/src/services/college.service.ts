import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';

/**
 * College/Tenant service.
 */

export async function listColleges(options: { page: number; limit: number; activeOnly?: boolean }) {
  const where: Record<string, unknown> = {};

  if (options.activeOnly !== false) {
    where.isActive = true;
  }

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.college.count({ where }),
  ]);

  return {
    colleges,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function getCollegeById(id: string) {
  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'College not found');
  }
  return college;
}

export async function createCollege(data: {
  name: string;
  code: string;
  domain?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}) {
  // Check code uniqueness
  const existing = await prisma.college.findUnique({ where: { code: data.code } });
  if (existing) {
    throw new AppError(409, ErrorCodes.CONFLICT, `College with code "${data.code}" already exists`);
  }

  return prisma.college.create({ data });
}

export async function updateCollege(id: string, data: Record<string, unknown>) {
  const college = await prisma.college.findUnique({ where: { id } });
  if (!college) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'College not found');
  }

  return prisma.college.update({ where: { id }, data });
}
