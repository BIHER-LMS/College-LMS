import { prisma } from '../config/db';

export class CurriculumService {
  async getCurriculum() {
    // CurriculumProgress table does not exist in the current schema.
    // Return an empty array as a stub.
    return [];
  }

  async updateCurriculum(
    id: string,
    data: {
      completionPercentage?: number;
      modulesBehind?: number;
    }
  ) {
    // Stub – no underlying table yet
    return {
      id,
      completionPercentage: data.completionPercentage || 0,
      modulesBehind: data.modulesBehind || 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const curriculumService = new CurriculumService();
