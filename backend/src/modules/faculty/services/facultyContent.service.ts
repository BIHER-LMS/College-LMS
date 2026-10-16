import prisma from '../../../config/database';
import { storageService } from '../../../services/storage.service';
import { memoryCache } from '../../../lib/cache';
import { AppError } from '../../../utils/errors';
import { logger } from '../../../utils/logger';
import { LearningContentType } from '@prisma/client';

export interface CreateTopicInput {
  classSubjectId: string;
  title: string;
  description?: string;
  orderIndex?: number;
  isPublished?: boolean;
}

export interface UpdateTopicInput {
  title?: string;
  description?: string;
  orderIndex?: number;
  isPublished?: boolean;
}

export interface CreateContentInput {
  topicId: string;
  classSubjectId: string;
  title: string;
  description?: string;
  contentType: LearningContentType;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  markdownContent?: string;
  durationSeconds?: number;
  orderIndex?: number;
  isDownloadable?: boolean;
  isPublished?: boolean;
}

export interface UpdateContentInput {
  title?: string;
  description?: string;
  topicId?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  markdownContent?: string;
  durationSeconds?: number;
  orderIndex?: number;
  isDownloadable?: boolean;
  isPublished?: boolean;
}

export class FacultyContentService {
  /**
   * Helper to invalidate topics cache for a class subject
   */
  private invalidateTopicsCache(classSubjectId: string) {
    memoryCache.delPattern(new RegExp(`^faculty_topics:${classSubjectId}`));
    memoryCache.delPattern(/^student_learning_contents:/);
  }

  /**
   * Verify that the faculty is authorized to manage this classSubject.
   */
  private async verifyFacultyAccess(facultyUid: string, classSubjectId: string): Promise<any> {
    if (!classSubjectId || typeof classSubjectId !== 'string' || !classSubjectId.trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'A valid classSubjectId is required.');
    }

    const accessCacheKey = `fac_access:${facultyUid}:${classSubjectId}`;
    const cachedAccess = memoryCache.get(accessCacheKey);
    if (cachedAccess) return cachedAccess;

    const facultyUser = await prisma.authedUser.findUnique({
      where: { uid: facultyUid },
      select: { department_id: true, college_id: true, subject_id: true, role: true }
    });

    const classSubject = await prisma.classSubject.findFirst({
      where: {
        id: classSubjectId,
        OR: [
          { faculty_uid: facultyUid },
          { class: { faculty_uid: facultyUid } },
          ...(facultyUser?.subject_id ? [{ subject_id: facultyUser.subject_id }] : []),
          ...(facultyUser?.department_id ? [{ class: { batch: { program: { department_id: facultyUser.department_id } } } }] : [])
        ]
      },
      include: {
        class: true,
        subject: true,
      },
    });

    if (!classSubject) {
      throw new AppError(403, 'FORBIDDEN', 'You are not assigned to teach this subject for this class.');
    }

    memoryCache.set(accessCacheKey, classSubject, 60);
    return classSubject;
  }

  // ==========================================
  // TOPIC MANAGEMENT
  // ==========================================

  async getTopics(classSubjectId: string, facultyUid: string) {
    await this.verifyFacultyAccess(facultyUid, classSubjectId);

    const cacheKey = `faculty_topics:${classSubjectId}:${facultyUid}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) return cached;

    const topics = await prisma.topic.findMany({
      where: { class_subject_id: classSubjectId },
      orderBy: { order_index: 'asc' },
      include: {
        contents: {
          orderBy: { order_index: 'asc' },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            due_date: true,
            max_points: true,
            allow_resubmission: true,
            _count: { select: { submissions: true } },
          },
        },
      },
    });

    const result = topics.map((t) => ({
      ...t,
      contents: (t.contents || []).map((c) => ({
        ...c,
        file_size_bytes: c.file_size_bytes != null ? Number(c.file_size_bytes) : null,
      })),
    }));

    memoryCache.set(cacheKey, result, 30);
    return result;
  }

  async createTopic(input: CreateTopicInput, facultyUid: string) {
    await this.verifyFacultyAccess(facultyUid, input.classSubjectId);

    if (!input.title?.trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Topic title is required.');
    }

    const maxOrder = await prisma.topic.aggregate({
      where: { class_subject_id: input.classSubjectId },
      _max: { order_index: true },
    });

    const nextOrder = input.orderIndex ?? ((maxOrder._max.order_index ?? -1) + 1);

    const topic = await prisma.topic.create({
      data: {
        class_subject_id: input.classSubjectId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        order_index: nextOrder,
        is_published: input.isPublished !== undefined ? input.isPublished : true,
      },
    });

    this.invalidateTopicsCache(input.classSubjectId);
    logger.info('Created topic:', { topicId: topic.id, facultyUid });
    return topic;
  }

  async updateTopic(topicId: string, input: UpdateTopicInput, facultyUid: string) {
    const existing = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Topic not found.');
    }

    await this.verifyFacultyAccess(facultyUid, existing.class_subject_id);

    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: {
        title: input.title !== undefined ? input.title.trim() : undefined,
        description: input.description !== undefined ? input.description?.trim() || null : undefined,
        order_index: input.orderIndex !== undefined ? input.orderIndex : undefined,
        is_published: input.isPublished !== undefined ? input.isPublished : undefined,
      },
    });

    this.invalidateTopicsCache(existing.class_subject_id);
    return updated;
  }

  async deleteTopic(topicId: string, facultyUid: string) {
    const existing = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Topic not found.');
    }

    await this.verifyFacultyAccess(facultyUid, existing.class_subject_id);

    await prisma.topic.delete({
      where: { id: topicId },
    });

    this.invalidateTopicsCache(existing.class_subject_id);
    return { message: 'Topic deleted successfully' };
  }

  // ==========================================
  // LEARNING CONTENT MANAGEMENT
  // ==========================================

  async getContents(classSubjectId: string, facultyUid: string, topicId?: string) {
    await this.verifyFacultyAccess(facultyUid, classSubjectId);

    const where: any = { class_subject_id: classSubjectId };
    if (topicId) {
      where.topic_id = topicId;
    }

    const contents = await prisma.learningContent.findMany({
      where,
      orderBy: [{ topic: { order_index: 'asc' } }, { order_index: 'asc' }],
      include: {
        topic: { select: { id: true, title: true } },
        _count: {
          select: {
            progressRecords: true,
            events: true,
          },
        },
      },
    });

    return contents.map((c) => ({
      ...c,
      file_size_bytes: c.file_size_bytes != null ? Number(c.file_size_bytes) : null,
    }));
  }

  async getContentById(contentId: string, facultyUid: string) {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: {
        topic: true,
        classSubject: {
          include: {
            class: true,
            subject: true,
          },
        },
      },
    });

    if (!content) {
      throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    }

    await this.verifyFacultyAccess(facultyUid, content.class_subject_id);
    return {
      ...content,
      file_size_bytes: content.file_size_bytes != null ? Number(content.file_size_bytes) : null,
    };
  }

  /**
   * Helper to parse YouTube video IDs
   */
  private extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }

  async createContent(input: CreateContentInput, facultyUid: string) {
    await this.verifyFacultyAccess(facultyUid, input.classSubjectId);

    if (!input.title?.trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Title is required.');
    }
    if (!input.topicId) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Topic ID is required.');
    }

    let youtubeId = input.youtubeVideoId || null;
    if (input.contentType === 'YOUTUBE' && input.youtubeUrl) {
      youtubeId = this.extractYouTubeId(input.youtubeUrl);
      if (!youtubeId) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid YouTube URL provided.');
      }
    }

    const maxOrder = await prisma.learningContent.aggregate({
      where: { topic_id: input.topicId },
      _max: { order_index: true },
    });

    const nextOrder = input.orderIndex ?? ((maxOrder._max.order_index ?? -1) + 1);

    const content = await prisma.learningContent.create({
      data: {
        topic_id: input.topicId,
        class_subject_id: input.classSubjectId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        content_type: input.contentType,
        file_url: input.fileUrl || null,
        file_name: input.fileName || null,
        file_size_bytes: input.fileSizeBytes ? BigInt(input.fileSizeBytes) : null,
        youtube_url: input.youtubeUrl || null,
        youtube_video_id: youtubeId,
        markdown_content: input.markdownContent || null,
        duration_seconds: input.durationSeconds || 0,
        order_index: nextOrder,
        is_downloadable: input.isDownloadable !== undefined ? input.isDownloadable : true,
        is_published: input.isPublished !== undefined ? input.isPublished : true,
        created_by_faculty_uid: facultyUid,
      },
    });

    this.invalidateTopicsCache(input.classSubjectId);
    return {
      ...content,
      file_size_bytes: content.file_size_bytes ? Number(content.file_size_bytes) : null,
    };
  }

  /**
   * Upload file to Cloudinary and create content item
   */
  async uploadAndCreateContent(
    file: Express.Multer.File,
    meta: {
      topicId: string;
      classSubjectId: string;
      title: string;
      description?: string;
      durationSeconds?: number;
      isDownloadable?: boolean;
      isPublished?: boolean;
    },
    facultyUid: string
  ) {
    await this.verifyFacultyAccess(facultyUid, meta.classSubjectId);

    // Determine content type based on extension or mime
    const originalName = file.originalname.toLowerCase();
    let contentType: LearningContentType = 'PDF';

    if (originalName.endsWith('.pdf')) {
      contentType = 'PDF';
    } else if (originalName.endsWith('.ppt') || originalName.endsWith('.pptx')) {
      contentType = 'PPT';
    } else if (originalName.endsWith('.doc') || originalName.endsWith('.docx')) {
      contentType = 'DOC';
    } else if (originalName.endsWith('.md') || originalName.endsWith('.markdown')) {
      contentType = 'MARKDOWN';
    } else if (file.mimetype.startsWith('video/') || originalName.endsWith('.mp4') || originalName.endsWith('.webm') || originalName.endsWith('.mov')) {
      contentType = 'VIDEO';
    }

    let markdownBody: string | null = null;
    let fileUrl = '';

    if (contentType === 'MARKDOWN') {
      markdownBody = file.buffer.toString('utf-8');
    }

    // Upload to Cloudinary
    const isVideo = contentType === 'VIDEO';
    const folder = `college_lms/learning_content/${meta.classSubjectId}`;
    const uploadRes = await storageService.uploadBuffer(file.buffer, {
      folder,
      originalFilename: file.originalname,
      resourceType: isVideo ? 'video' : 'auto',
      tags: ['learning_content', `class_subject_${meta.classSubjectId}`, contentType],
    });

    fileUrl = uploadRes.secureUrl || uploadRes.url;

    return this.createContent(
      {
        topicId: meta.topicId,
        classSubjectId: meta.classSubjectId,
        title: meta.title || file.originalname,
        description: meta.description,
        contentType,
        fileUrl,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        markdownContent: markdownBody || undefined,
        durationSeconds: meta.durationSeconds || (isVideo ? 300 : 0),
        isDownloadable: meta.isDownloadable !== undefined ? meta.isDownloadable : true,
        isPublished: meta.isPublished !== undefined ? meta.isPublished : true,
      },
      facultyUid
    );
  }

  async updateContent(contentId: string, input: UpdateContentInput, facultyUid: string) {
    const existing = await prisma.learningContent.findUnique({
      where: { id: contentId },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    }

    await this.verifyFacultyAccess(facultyUid, existing.class_subject_id);

    let youtubeId = existing.youtube_video_id;
    if (input.youtubeUrl !== undefined) {
      youtubeId = input.youtubeUrl ? this.extractYouTubeId(input.youtubeUrl) : null;
    }

    const updated = await prisma.learningContent.update({
      where: { id: contentId },
      data: {
        title: input.title !== undefined ? input.title.trim() : undefined,
        description: input.description !== undefined ? input.description?.trim() || null : undefined,
        topic_id: input.topicId !== undefined ? input.topicId : undefined,
        youtube_url: input.youtubeUrl !== undefined ? input.youtubeUrl : undefined,
        youtube_video_id: youtubeId,
        markdown_content: input.markdownContent !== undefined ? input.markdownContent : undefined,
        duration_seconds: input.durationSeconds !== undefined ? input.durationSeconds : undefined,
        order_index: input.orderIndex !== undefined ? input.orderIndex : undefined,
        is_downloadable: input.isDownloadable !== undefined ? input.isDownloadable : undefined,
        is_published: input.isPublished !== undefined ? input.isPublished : undefined,
      },
    });

    this.invalidateTopicsCache(existing.class_subject_id);
    return {
      ...updated,
      file_size_bytes: updated.file_size_bytes ? Number(updated.file_size_bytes) : null,
    };
  }

  async deleteContent(contentId: string, facultyUid: string) {
    const existing = await prisma.learningContent.findUnique({
      where: { id: contentId },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    }

    await this.verifyFacultyAccess(facultyUid, existing.class_subject_id);

    await prisma.learningContent.delete({
      where: { id: contentId },
    });

    this.invalidateTopicsCache(existing.class_subject_id);
    return { message: 'Content deleted successfully' };
  }

  // ==========================================
  // VERSIONED ASSIGNMENT GRADING
  // ==========================================

  async gradeSubmission(
    submissionId: string,
    data: {
      grade?: string;
      gradePoints?: number;
      feedback?: string;
      versionNumber?: number;
    },
    facultyUid: string
  ) {
    const submission = await prisma.studentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { class_subject_id: true, max_points: true } },
        versions: { orderBy: { version_number: 'desc' } },
      },
    });

    if (!submission) {
      throw new AppError(404, 'NOT_FOUND', 'Submission not found.');
    }

    await this.verifyFacultyAccess(facultyUid, submission.assignment.class_subject_id);

    const targetVersionNumber = data.versionNumber || (submission.versions[0]?.version_number ?? 1);

    // Update primary submission
    const updatedSubmission = await prisma.studentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: data.grade || (data.gradePoints !== undefined ? String(data.gradePoints) : undefined),
        feedback: data.feedback,
        status: 'GRADED',
        graded_at: new Date(),
        graded_by_uid: facultyUid,
      },
    });

    // Update version if exists
    const targetVersion = submission.versions.find(v => v.version_number === targetVersionNumber);
    if (targetVersion) {
      await prisma.submissionVersion.update({
        where: { id: targetVersion.id },
        data: {
          grade: data.grade || (data.gradePoints !== undefined ? String(data.gradePoints) : undefined),
          grade_points: data.gradePoints,
          feedback: data.feedback,
          graded_at: new Date(),
          graded_by_uid: facultyUid,
        },
      });
    }

    return updatedSubmission;
  }

  async getSubmissionVersions(submissionId: string, facultyUid: string) {
    const submission = await prisma.studentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { class_subject_id: true } },
        versions: { orderBy: { version_number: 'desc' } },
        student: { select: { uid: true, display_name: true, email: true, register_number: true, photo_url: true } },
      },
    });

    if (!submission) {
      throw new AppError(404, 'NOT_FOUND', 'Submission not found.');
    }

    await this.verifyFacultyAccess(facultyUid, submission.assignment.class_subject_id);
    return submission;
  }
}

export const facultyContentService = new FacultyContentService();
