import { PaginationMeta } from '../utils/response';

// The Prisma schema does not have an Announcement model.
// This service provides in-memory stub data until the model is added.

interface Announcement {
  id: string;
  title: string;
  message: string;
  scope: string;
  classification: string;
  createdBy: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

const stubAnnouncements: Announcement[] = [];

export class AnnouncementService {
  async getAnnouncements(params?: { page?: number; limit?: number }) {
    const page = params?.page ? Math.max(1, params.page) : 1;
    const limit = params?.limit ? Math.max(1, params.limit) : 20;
    const skip = (page - 1) * limit;

    const total = stubAnnouncements.length;
    const data = stubAnnouncements.slice(skip, skip + limit);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return { data, pagination };
  }

  async createAnnouncement(data: {
    title: string;
    message: string;
    scope: string;
    classification: string;
    createdBy?: string;
  }) {
    const now = new Date().toISOString();
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title,
      message: data.message,
      scope: data.scope,
      classification: data.classification,
      createdBy: data.createdBy || null,
      authorName: 'Department Administrator',
      createdAt: now,
      updatedAt: now,
    };
    stubAnnouncements.unshift(announcement);
    return announcement;
  }

  async updateAnnouncement(
    id: string,
    data: Partial<{ title: string; message: string; scope: string; classification: string }>
  ) {
    const index = stubAnnouncements.findIndex((a) => a.id === id);
    if (index === -1) return null;
    Object.assign(stubAnnouncements[index], data, { updatedAt: new Date().toISOString() });
    return stubAnnouncements[index];
  }

  async deleteAnnouncement(id: string) {
    const index = stubAnnouncements.findIndex((a) => a.id === id);
    if (index !== -1) stubAnnouncements.splice(index, 1);
    return { deleted: true };
  }
}

export const announcementService = new AnnouncementService();
