import prisma from '../../../config/database';
import { storageService } from '../../../services/storage.service';
import { AppError } from '../../../utils/errors';
import { StudentContext } from '../student.types';
import { LearningEventType } from '@prisma/client';
import { AnalyticsFeatureEngine } from '../../faculty/services/analyticsFeatureEngine';
import { logger } from '../../../utils/logger';

export class StudentContentService {
  /**
   * Get all published subjects, topics, and contents for student's enrolled class.
   */
  async getStudentSubjectsAndContents(studentContext: StudentContext) {
    if (!studentContext.classId) {
      throw new AppError(400, 'BAD_REQUEST', 'Student is not assigned to any class.');
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { class_id: studentContext.classId },
      include: {
        subject: true,
        faculty: {
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
          },
        },
        topics: {
          where: { is_published: true },
          orderBy: { order_index: 'asc' },
          include: {
            contents: {
              where: { is_published: true },
              orderBy: { order_index: 'asc' },
              select: {
                id: true,
                topic_id: true,
                title: true,
                description: true,
                content_type: true,
                file_url: true,
                file_name: true,
                file_size_bytes: true,
                youtube_url: true,
                youtube_video_id: true,
                duration_seconds: true,
                order_index: true,
                is_downloadable: true,
                created_at: true,
              },
            },
          },
        },
      },
    });

    // Fetch all student progress records for this student in this class
    const progressRecords = await prisma.studentContentProgress.findMany({
      where: { student_uid: studentContext.uid },
    });

    const progressMap = new Map<string, any>();
    for (const p of progressRecords) {
      progressMap.set(p.content_id, p);
    }

    // Format response and attach progress
    const formattedSubjects = classSubjects.map(cs => {
      let totalItems = 0;
      let completedItems = 0;

      const topics = cs.topics.map(t => {
        const contents = t.contents.map(c => {
          totalItems++;
          const p = progressMap.get(c.id);
          const isCompleted = p?.is_completed || false;
          if (isCompleted) completedItems++;

          return {
            id: c.id,
            topicId: c.topic_id,
            title: c.title,
            description: c.description,
            contentType: c.content_type,
            fileUrl: c.file_url,
            fileName: c.file_name,
            fileSizeBytes: c.file_size_bytes ? Number(c.file_size_bytes) : null,
            youtubeUrl: c.youtube_url,
            youtubeVideoId: c.youtube_video_id,
            durationSeconds: c.duration_seconds,
            isDownloadable: c.is_downloadable,
            progress: {
              isCompleted,
              completionPercentage: p?.completion_percentage || 0,
              watchTimeSeconds: p?.watch_time_seconds || 0,
              lastPositionSeconds: p?.last_position_seconds || 0,
              rewindCount: p?.rewind_count || 0,
              seekCount: p?.seek_count || 0,
              lastAccessedAt: p?.last_accessed_at || null,
            },
          };
        });

        return {
          id: t.id,
          title: t.title,
          description: t.description,
          orderIndex: t.order_index,
          contents,
        };
      });

      const overallCompletionRate = totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;

      return {
        classSubjectId: cs.id,
        subject: {
          id: cs.subject.id,
          name: cs.subject.name,
          code: cs.subject.code,
          credits: cs.subject.credits,
        },
        faculty: cs.faculty,
        totalItems,
        completedItems,
        overallCompletionRate,
        topics,
      };
    });

    return formattedSubjects;
  }

  /**
   * Get single learning content details and log view
   */
  async getContentDetails(contentId: string, studentContext: StudentContext) {
    if (!studentContext.classId) {
      throw new AppError(400, 'BAD_REQUEST', 'Student is not assigned to any class.');
    }

    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: {
        topic: true,
        classSubject: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    if (!content || !content.is_published) {
      throw new AppError(404, 'NOT_FOUND', 'Content not found or not published.');
    }

    // Class isolation check
    if (content.classSubject.class_id !== studentContext.classId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this content.');
    }

    // Get or initialize progress
    let progress = await prisma.studentContentProgress.findUnique({
      where: {
        student_uid_content_id: {
          student_uid: studentContext.uid,
          content_id: contentId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.studentContentProgress.create({
        data: {
          student_uid: studentContext.uid,
          content_id: contentId,
          class_subject_id: content.class_subject_id,
          last_accessed_at: new Date(),
        },
      });

      // Record initial VIEW event
      await prisma.learningEvent.create({
        data: {
          student_uid: studentContext.uid,
          content_id: contentId,
          class_subject_id: content.class_subject_id,
          event_type: 'VIEW',
          position_seconds: 0,
          duration_seconds: content.duration_seconds || 0,
        },
      });
    } else {
      await prisma.studentContentProgress.update({
        where: { id: progress.id },
        data: { last_accessed_at: new Date() },
      });
    }

    return {
      id: content.id,
      title: content.title,
      description: content.description,
      contentType: content.content_type,
      fileUrl: content.file_url,
      fileName: content.file_name,
      fileSizeBytes: content.file_size_bytes ? Number(content.file_size_bytes) : null,
      youtubeUrl: content.youtube_url,
      youtubeVideoId: content.youtube_video_id,
      markdownContent: content.markdown_content,
      durationSeconds: content.duration_seconds,
      isDownloadable: content.is_downloadable,
      topic: {
        id: content.topic.id,
        title: content.topic.title,
      },
      classSubject: {
        id: content.classSubject.id,
        subjectName: content.classSubject.subject.name,
        subjectCode: content.classSubject.subject.code,
      },
      progress: {
        watchTimeSeconds: progress.watch_time_seconds,
        lastPositionSeconds: progress.last_position_seconds,
        maxPositionSeconds: progress.max_position_seconds,
        completionPercentage: progress.completion_percentage,
        isCompleted: progress.is_completed,
        rewindCount: progress.rewind_count,
        seekCount: progress.seek_count,
      },
    };
  }

  /**
   * Log raw telemetry event and update progress
   */
  async recordLearningEvent(
    contentId: string,
    event: {
      eventType: LearningEventType;
      positionSeconds?: number;
      durationSeconds?: number;
      playbackRate?: number;
      seekFrom?: number;
      seekTo?: number;
      deltaWatchSeconds?: number;
      metadata?: any;
    },
    studentContext: StudentContext
  ) {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: { classSubject: true },
    });

    if (!content || !content.is_published) {
      throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    }

    if (content.classSubject.class_id !== studentContext.classId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied.');
    }

    const pos = Math.max(0, event.positionSeconds ?? 0);
    const dur = Math.max(0, event.durationSeconds ?? content.duration_seconds ?? 0);

    // 1. Append raw telemetry event
    await prisma.learningEvent.create({
      data: {
        student_uid: studentContext.uid,
        content_id: contentId,
        class_subject_id: content.class_subject_id,
        event_type: event.eventType,
        position_seconds: pos,
        duration_seconds: dur,
        playback_rate: event.playbackRate ?? 1.0,
        seek_from: event.seekFrom ?? null,
        seek_to: event.seekTo ?? null,
        metadata: event.metadata ?? null,
      },
    });

    // 2. Fetch or create progress record
    let progress = await prisma.studentContentProgress.findUnique({
      where: {
        student_uid_content_id: {
          student_uid: studentContext.uid,
          content_id: contentId,
        },
      },
    });

    const isRewind = event.eventType === 'REWIND';
    const isSeek = event.eventType === 'SEEK';
    const isDownload = event.eventType === 'DOWNLOAD';
    const isComplete = event.eventType === 'COMPLETE';

    const addedWatchTime = event.deltaWatchSeconds ?? (
      ['PLAY', 'TIME_UPDATE', 'PROGRESS'].includes(event.eventType) ? 5 : 0
    );

    let maxPos = progress?.max_position_seconds ?? 0;
    if (pos > maxPos) {
      maxPos = pos;
    }

    let completionPercentage = progress?.completion_percentage ?? 0;
    if (dur > 0) {
      completionPercentage = Math.min(100, Math.round((maxPos / dur) * 100));
    } else if (['PDF', 'PPT', 'DOC', 'MARKDOWN'].includes(content.content_type)) {
      completionPercentage = isComplete ? 100 : Math.max(completionPercentage, 50);
    }

    const markAsCompleted = isComplete || completionPercentage >= 90 || (progress?.is_completed ?? false);

    const updatedProgress = await prisma.studentContentProgress.upsert({
      where: {
        student_uid_content_id: {
          student_uid: studentContext.uid,
          content_id: contentId,
        },
      },
      create: {
        student_uid: studentContext.uid,
        content_id: contentId,
        class_subject_id: content.class_subject_id,
        watch_time_seconds: addedWatchTime,
        last_position_seconds: pos,
        max_position_seconds: maxPos,
        completion_percentage: completionPercentage,
        rewind_count: isRewind ? 1 : 0,
        seek_count: isSeek ? 1 : 0,
        download_count: isDownload ? 1 : 0,
        is_completed: markAsCompleted,
        completed_at: markAsCompleted ? new Date() : null,
        last_accessed_at: new Date(),
      },
      update: {
        watch_time_seconds: { increment: addedWatchTime },
        last_position_seconds: pos,
        max_position_seconds: maxPos,
        completion_percentage: completionPercentage,
        rewind_count: isRewind ? { increment: 1 } : undefined,
        seek_count: isSeek ? { increment: 1 } : undefined,
        download_count: isDownload ? { increment: 1 } : undefined,
        is_completed: markAsCompleted,
        completed_at: markAsCompleted && !progress?.is_completed ? new Date() : undefined,
        last_accessed_at: new Date(),
      },
    });

    // 3. Trigger async ML feature recalculation
    AnalyticsFeatureEngine.recalculateStudentFeatures(studentContext.uid, content.class_subject_id).catch(err => {
      logger.error('Background feature recalculation error:', err);
    });

    return updatedProgress;
  }

  /**
   * Authorize file download and record telemetry
   */
  async getAuthorizedDownload(contentId: string, studentContext: StudentContext) {
    const content = await prisma.learningContent.findUnique({
      where: { id: contentId },
      include: { classSubject: true },
    });

    if (!content || !content.is_published) {
      throw new AppError(404, 'NOT_FOUND', 'Content not found.');
    }

    if (content.classSubject.class_id !== studentContext.classId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied.');
    }

    if (!content.is_downloadable || !content.file_url) {
      throw new AppError(403, 'FORBIDDEN', 'Downloads are not permitted for this learning material.');
    }

    // Log DOWNLOAD event and increment count
    await this.recordLearningEvent(contentId, { eventType: 'DOWNLOAD' }, studentContext);

    return {
      fileUrl: content.file_url,
      fileName: content.file_name || `${content.title}.${content.content_type.toLowerCase()}`,
      contentType: content.content_type,
    };
  }

  /**
   * Versioned Assignment Submission
   */
  async submitAssignmentWithVersion(
    assignmentId: string,
    file: Express.Multer.File,
    studentNotes: string | undefined,
    studentContext: StudentContext
  ) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classSubject: true,
        submissions: {
          where: { student_uid: studentContext.uid },
          include: { versions: { orderBy: { version_number: 'desc' } } },
        },
      },
    });

    if (!assignment) {
      throw new AppError(404, 'NOT_FOUND', 'Assignment not found.');
    }

    if (assignment.classSubject.class_id !== studentContext.classId) {
      throw new AppError(403, 'FORBIDDEN', 'Assignment not assigned to your class.');
    }

    const existingSubmission = assignment.submissions[0];

    // Check resubmission rules
    if (existingSubmission && assignment.allow_resubmission === false) {
      throw new AppError(400, 'BAD_REQUEST', 'Resubmissions are not allowed for this assignment.');
    }

    // Upload submission file
    const uploadRes = await storageService.uploadAssignmentSubmission(
      file.buffer,
      file.originalname,
      studentContext.uid,
      assignmentId
    );

    const isLate = assignment.due_date ? new Date() > assignment.due_date : false;
    const nextVersionNumber = (existingSubmission?.versions[0]?.version_number ?? 0) + 1;

    // Create or update primary submission
    const submission = await prisma.studentSubmission.upsert({
      where: {
        assignment_id_student_uid: {
          assignment_id: assignmentId,
          student_uid: studentContext.uid,
        },
      },
      create: {
        assignment_id: assignmentId,
        student_uid: studentContext.uid,
        file_url: uploadRes.secureUrl,
        status: 'SUBMITTED',
        is_late: isLate,
        submitted_at: new Date(),
      },
      update: {
        file_url: uploadRes.secureUrl,
        status: 'SUBMITTED',
        is_late: isLate,
        submitted_at: new Date(),
      },
    });

    // Create version record
    const versionRecord = await prisma.submissionVersion.create({
      data: {
        submission_id: submission.id,
        version_number: nextVersionNumber,
        file_url: uploadRes.secureUrl,
        file_name: file.originalname,
        file_size_bytes: file.size,
        is_late: isLate,
        student_notes: studentNotes || null,
        submitted_at: new Date(),
      },
    });

    // Recalculate features
    AnalyticsFeatureEngine.recalculateStudentFeatures(studentContext.uid, assignment.class_subject_id).catch(() => {});

    return {
      submission,
      version: versionRecord,
    };
  }
}

export const studentContentService = new StudentContentService();
