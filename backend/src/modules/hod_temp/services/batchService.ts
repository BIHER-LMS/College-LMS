import { prisma } from '../config/db';
import { NotFoundError } from '../utils/errors';

export class BatchService {
  async getBatches(programId?: string) {
    const where: any = {};
    if (programId) where.program_id = programId;

    const batches = await prisma.batch.findMany({
      where,
      orderBy: { start_year: 'desc' },
      include: { program: true },
    });

    return batches.map((b) => ({
      id: b.id,
      name: `${b.program.name} (${b.start_year}-${b.end_year})`,
      programId: b.program_id,
      programName: b.program.name,
      startYear: b.start_year,
      endYear: b.end_year,
      status: (b.is_active ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
    }));
  }

  async getBatchById(id: string) {
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { program: true, classes: true },
    });
    if (!batch) throw new NotFoundError('Batch not found');
    return {
      id: batch.id,
      name: `${batch.program.name} (${batch.start_year}-${batch.end_year})`,
      programId: batch.program_id,
      programName: batch.program.name,
      startYear: batch.start_year,
      endYear: batch.end_year,
      status: (batch.is_active ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
    };
  }

  async createBatch(data: {
    programId: string;
    startYear: number;
    endYear: number;
  }) {
    return prisma.batch.create({
      data: {
        program_id: data.programId,
        start_year: data.startYear,
        end_year: data.endYear,
        is_active: true,
      },
    });
  }

  async updateBatch(id: string, data: Partial<{ programId: string; startYear: number; endYear: number; isActive: boolean }>) {
    const updateData: any = {};
    if (data.programId) updateData.program_id = data.programId;
    if (data.startYear !== undefined) updateData.start_year = data.startYear;
    if (data.endYear !== undefined) updateData.end_year = data.endYear;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return prisma.batch.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteBatch(id: string) {
    return prisma.batch.delete({
      where: { id },
    });
  }
}

export const batchService = new BatchService();
