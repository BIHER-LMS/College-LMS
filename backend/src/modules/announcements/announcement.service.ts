import prisma from '../../config/database';
import { logger } from '../../utils/logger';

export interface AnnouncementRecord {
  id: string;
  college_id: string;
  title: string;
  description: string;
  image_url: string | null;
  target_audience: string[];
  category: string;
  priority: string;
  is_pinned: boolean;
  is_active: boolean;
  expires_at: string | null;
  created_by_uid: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementInput {
  title: string;
  description: string;
  image_url?: string | null;
  target_audience: string[];
  category?: string;
  priority?: string;
  is_pinned?: boolean;
  is_active?: boolean;
  expires_at?: string | null;
  created_by_uid?: string | null;
  created_by_name?: string | null;
}

export interface UpdateAnnouncementInput {
  title?: string;
  description?: string;
  image_url?: string | null;
  target_audience?: string[];
  category?: string;
  priority?: string;
  is_pinned?: boolean;
  is_active?: boolean;
  expires_at?: string | null;
}

export class AnnouncementService {
  async createAnnouncement(
    collegeId: string,
    input: CreateAnnouncementInput
  ): Promise<AnnouncementRecord> {
    const title = input.title.trim();
    const description = input.description.trim();
    const imageUrl = input.image_url?.trim() || null;
    const targetAudience = Array.isArray(input.target_audience) && input.target_audience.length > 0
      ? input.target_audience
      : ['HOD', 'FACULTY', 'STUDENT'];
    const category = input.category || 'GENERAL';
    const priority = input.priority || 'NORMAL';
    const isPinned = Boolean(input.is_pinned);
    const isActive = input.is_active !== undefined ? Boolean(input.is_active) : true;
    const expiresAt = input.expires_at || null;
    const createdByUid = input.created_by_uid || null;
    const createdByName = input.created_by_name || 'College Administration';

    const effectiveCollegeId = (collegeId && collegeId !== 'undefined' && collegeId !== 'default')
      ? collegeId
      : 'col-1790654578727-zhdd';

    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `
        INSERT INTO announcements (
          college_id, title, description, image_url, target_audience,
          category, priority, is_pinned, is_active, expires_at,
          created_by_uid, created_by_name, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING
          id, college_id, title, description, image_url, target_audience,
          category, priority, is_pinned, is_active, expires_at,
          created_by_uid, created_by_name, created_at, updated_at
        `,
        effectiveCollegeId,
        title,
        description,
        imageUrl,
        targetAudience,
        category,
        priority,
        isPinned,
        isActive,
        expiresAt ? new Date(expiresAt) : null,
        createdByUid,
        createdByName
      );

      if (rows && rows.length > 0) {
        return rows[0] as AnnouncementRecord;
      }
      throw new Error('Database insert succeeded but returned no rows');
    } catch (err: any) {
      logger.error('Failed to insert announcement into PostgreSQL:', { error: err.message });
      throw err;
    }
  }

  async getAnnouncements(
    collegeId?: string,
    options?: {
      role?: string;
      isClassIncharge?: boolean;
      targetAudience?: string;
      category?: string;
      search?: string;
      isActiveOnly?: boolean;
    }
  ): Promise<AnnouncementRecord[]> {
    const role = options?.role?.toUpperCase();
    const isClassIncharge = Boolean(options?.isClassIncharge);
    const isActiveOnly = options?.isActiveOnly !== false;

    try {
      let query = `
        SELECT
          id, college_id, title, description, image_url, target_audience,
          category, priority, is_pinned, is_active, expires_at,
          created_by_uid, created_by_name, created_at, updated_at
        FROM announcements
        WHERE ($1 = '' OR $1 = 'default' OR college_id = $1 OR college_id = 'default' OR college_id IS NULL)
      `;
      const params: any[] = [collegeId || ''];
      let paramIndex = 2;

      if (isActiveOnly) {
        query += ` AND is_active = true`;
      }

      // Role and audience filtering:
      if (role && role !== 'COLLEGE_ADMIN' && role !== 'SUPER_ADMIN') {
        if (role === 'HOD') {
          query += ` AND ('HOD' = ANY(target_audience) OR 'ALL' = ANY(target_audience))`;
        } else if (role === 'FACULTY') {
          if (isClassIncharge) {
            query += ` AND ('FACULTY' = ANY(target_audience) OR 'CLASS_INCHARGE' = ANY(target_audience) OR 'ALL' = ANY(target_audience))`;
          } else {
            // General faculty member who is NOT a class incharge:
            query += ` AND ('FACULTY' = ANY(target_audience) OR 'ALL' = ANY(target_audience))`;
          }
        } else if (role === 'STUDENT') {
          query += ` AND ('STUDENT' = ANY(target_audience) OR 'ALL' = ANY(target_audience))`;
        }
      } else if (options?.targetAudience && options.targetAudience !== 'ALL') {
        query += ` AND $${paramIndex} = ANY(target_audience)`;
        params.push(options.targetAudience);
        paramIndex++;
      }

      if (options?.category && options.category !== 'ALL') {
        query += ` AND category = $${paramIndex}`;
        params.push(options.category);
        paramIndex++;
      }

      if (options?.search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${options.search}%`);
        paramIndex++;
      }

      query += ` ORDER BY is_pinned DESC, created_at DESC`;

      const rows: any = await prisma.$queryRawUnsafe(query, ...params);
      if (Array.isArray(rows)) {
        return rows as AnnouncementRecord[];
      }
      return [];
    } catch (err: any) {
      logger.error('Failed to query announcements from PostgreSQL:', { error: err.message });
      return [];
    }
  }

  async updateAnnouncement(
    id: string,
    collegeId: string,
    input: UpdateAnnouncementInput
  ): Promise<AnnouncementRecord | null> {
    try {
      const updates: string[] = ['updated_at = NOW()'];
      const params: any[] = [id];
      let paramIdx = 2;

      if (input.title !== undefined) {
        updates.push(`title = $${paramIdx++}`);
        params.push(input.title.trim());
      }
      if (input.description !== undefined) {
        updates.push(`description = $${paramIdx++}`);
        params.push(input.description.trim());
      }
      if (input.image_url !== undefined) {
        updates.push(`image_url = $${paramIdx++}`);
        params.push(input.image_url?.trim() || null);
      }
      if (input.target_audience !== undefined) {
        updates.push(`target_audience = $${paramIdx++}::text[]`);
        params.push(input.target_audience);
      }
      if (input.category !== undefined) {
        updates.push(`category = $${paramIdx++}`);
        params.push(input.category);
      }
      if (input.priority !== undefined) {
        updates.push(`priority = $${paramIdx++}`);
        params.push(input.priority);
      }
      if (input.is_pinned !== undefined) {
        updates.push(`is_pinned = $${paramIdx++}`);
        params.push(Boolean(input.is_pinned));
      }
      if (input.is_active !== undefined) {
        updates.push(`is_active = $${paramIdx++}`);
        params.push(Boolean(input.is_active));
      }
      if (input.expires_at !== undefined) {
        updates.push(`expires_at = $${paramIdx++}`);
        params.push(input.expires_at ? new Date(input.expires_at) : null);
      }

      const rows: any = await prisma.$queryRawUnsafe(
        `
        UPDATE announcements
        SET ${updates.join(', ')}
        WHERE id = $1::uuid
        RETURNING
          id, college_id, title, description, image_url, target_audience,
          category, priority, is_pinned, is_active, expires_at,
          created_by_uid, created_by_name, created_at, updated_at
        `,
        ...params
      );

      if (rows && rows.length > 0) {
        return rows[0] as AnnouncementRecord;
      }
      return null;
    } catch (err: any) {
      logger.error('Failed to update announcement in PostgreSQL:', { error: err.message });
      throw err;
    }
  }

  async deleteAnnouncement(id: string, _collegeId?: string): Promise<boolean> {
    try {
      const res: any = await prisma.$executeRawUnsafe(
        `DELETE FROM announcements WHERE id = $1::uuid`,
        id
      );
      return res > 0;
    } catch (err: any) {
      logger.error('Failed to delete announcement from PostgreSQL:', { error: err.message });
      throw err;
    }
  }
}

export const announcementService = new AnnouncementService();
