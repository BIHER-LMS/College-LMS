import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../src/config/database';
import { facultyContentService } from '../src/modules/faculty/services/facultyContent.service';
import { facultyAnalyticsService } from '../src/modules/faculty/services/facultyAnalytics.service';
import { studentContentService } from '../src/modules/student/services/studentContent.service';
import { AnalyticsFeatureEngine } from '../src/modules/faculty/services/analyticsFeatureEngine';
import { AppError } from '../src/utils/errors';

describe('Learning Content Management & Learning Analytics Module', () => {
  const mockFacultyUid = 'fac-prof-101';
  const mockStudentUid = 'stu-john-202';
  const mockClassId = 'class-uuid-303';
  const mockClassSubjectId = 'cs-uuid-404';
  const mockTopicId = 'topic-uuid-505';
  const mockContentId = 'content-uuid-606';
  const mockAssignmentId = 'assign-uuid-707';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // 1. FACULTY CONTENT MANAGEMENT & RBAC
  // ==========================================
  describe('Faculty Content Management & Class/Subject Isolation', () => {
    it('allows assigned faculty to create a syllabus topic', async () => {
      (prisma.classSubject.findFirst as any).mockResolvedValue({
        id: mockClassSubjectId,
        class_id: mockClassId,
        faculty_uid: mockFacultyUid,
        class: { name: 'CS Year 3 A' },
        subject: { name: 'Deep Learning', code: 'CS601' },
      });

      (prisma.topic.aggregate as any).mockResolvedValue({
        _max: { order_index: 2 },
      });

      (prisma.topic.create as any).mockResolvedValue({
        id: mockTopicId,
        class_subject_id: mockClassSubjectId,
        title: 'Unit 1: Introduction to Tensors',
        order_index: 3,
        is_published: true,
      });

      const topic = await facultyContentService.createTopic(
        {
          classSubjectId: mockClassSubjectId,
          title: 'Unit 1: Introduction to Tensors',
        },
        mockFacultyUid
      );

      expect(topic.title).toBe('Unit 1: Introduction to Tensors');
      expect(topic.order_index).toBe(3);
      expect(prisma.topic.create).toHaveBeenCalled();
    });

    it('rejects topic creation if faculty is not assigned to the class-subject', async () => {
      (prisma.classSubject.findFirst as any).mockResolvedValue(null);

      await expect(
        facultyContentService.createTopic(
          {
            classSubjectId: mockClassSubjectId,
            title: 'Unauthorized Topic',
          },
          'unassigned-faculty'
        )
      ).rejects.toThrow(AppError);
    });

    it('creates multimodal learning content (YouTube & Markdown)', async () => {
      (prisma.classSubject.findFirst as any).mockResolvedValue({
        id: mockClassSubjectId,
        faculty_uid: mockFacultyUid,
      });

      (prisma.learningContent.aggregate as any).mockResolvedValue({
        _max: { order_index: 0 },
      });

      (prisma.learningContent.create as any).mockResolvedValue({
        id: mockContentId,
        topic_id: mockTopicId,
        class_subject_id: mockClassSubjectId,
        title: 'Video Lecture: Backpropagation Mechanics',
        content_type: 'YOUTUBE',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_video_id: 'dQw4w9WgXcQ',
        duration_seconds: 900,
        is_downloadable: false,
        is_published: true,
        created_by_faculty_uid: mockFacultyUid,
      });

      const content = await facultyContentService.createContent(
        {
          topicId: mockTopicId,
          classSubjectId: mockClassSubjectId,
          title: 'Video Lecture: Backpropagation Mechanics',
          contentType: 'YOUTUBE',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationSeconds: 900,
          isDownloadable: false,
        },
        mockFacultyUid
      );

      expect(content.content_type).toBe('YOUTUBE');
      expect(content.youtube_video_id).toBe('dQw4w9WgXcQ');
      expect(content.is_downloadable).toBe(false);
    });
  });

  // ==========================================
  // 2. STUDENT ACCESS & TELEMETRY
  // ==========================================
  describe('Student Access & Granular Telemetry Tracking', () => {
    const studentContext: any = {
      uid: mockStudentUid,
      email: 'student@college.edu',
      role: 'STUDENT',
      classId: mockClassId,
    };

    it('rejects students attempting to view content from another class', async () => {
      (prisma.learningContent.findUnique as any).mockResolvedValue({
        id: mockContentId,
        is_published: true,
        classSubject: { class_id: 'other-class-999' },
      });

      await expect(
        studentContentService.getContentDetails(mockContentId, studentContext)
      ).rejects.toThrow(AppError);
    });

    it('records telemetry event and updates student watch time & position', async () => {
      (prisma.learningContent.findUnique as any).mockResolvedValue({
        id: mockContentId,
        duration_seconds: 600,
        content_type: 'VIDEO',
        is_published: true,
        class_subject_id: mockClassSubjectId,
        classSubject: { class_id: mockClassId },
      });

      (prisma.studentContentProgress.findUnique as any).mockResolvedValue({
        id: 'progress-1',
        student_uid: mockStudentUid,
        content_id: mockContentId,
        max_position_seconds: 120,
        watch_time_seconds: 120,
        completion_percentage: 20,
        rewind_count: 1,
        seek_count: 0,
        is_completed: false,
      });

      (prisma.studentContentProgress.upsert as any).mockResolvedValue({
        id: 'progress-1',
        watch_time_seconds: 125,
        last_position_seconds: 125,
        max_position_seconds: 125,
        completion_percentage: 21,
        is_completed: false,
      });

      const progress = await studentContentService.recordLearningEvent(
        mockContentId,
        {
          eventType: 'TIME_UPDATE',
          positionSeconds: 125,
          durationSeconds: 600,
          deltaWatchSeconds: 5,
        },
        studentContext
      );

      expect(prisma.learningEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            event_type: 'TIME_UPDATE',
            student_uid: mockStudentUid,
            position_seconds: 125,
          }),
        })
      );
      expect(progress.completion_percentage).toBe(21);
    });

    it('increments rewind count when a rewind event occurs', async () => {
      (prisma.learningContent.findUnique as any).mockResolvedValue({
        id: mockContentId,
        duration_seconds: 600,
        content_type: 'VIDEO',
        is_published: true,
        class_subject_id: mockClassSubjectId,
        classSubject: { class_id: mockClassId },
      });

      (prisma.studentContentProgress.findUnique as any).mockResolvedValue({
        id: 'progress-1',
        rewind_count: 2,
      });

      (prisma.studentContentProgress.upsert as any).mockResolvedValue({
        id: 'progress-1',
        rewind_count: 3,
      });

      const progress = await studentContentService.recordLearningEvent(
        mockContentId,
        {
          eventType: 'REWIND',
          positionSeconds: 45,
          seekFrom: 90,
          seekTo: 45,
        },
        studentContext
      );

      expect(prisma.learningEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            event_type: 'REWIND',
            seek_from: 90,
            seek_to: 45,
          }),
        })
      );
      expect(progress.rewind_count).toBe(3);
    });

    it('enforces authorized downloads and blocks restricted materials', async () => {
      // Content with download restricted
      (prisma.learningContent.findUnique as any).mockResolvedValueOnce({
        id: mockContentId,
        is_published: true,
        is_downloadable: false,
        file_url: 'https://res.cloudinary.com/demo/file.pdf',
        classSubject: { class_id: mockClassId },
      });

      await expect(
        studentContentService.getAuthorizedDownload(mockContentId, studentContext)
      ).rejects.toThrow(/not permitted/i);

      // Content with download allowed
      (prisma.learningContent.findUnique as any).mockResolvedValueOnce({
        id: mockContentId,
        is_published: true,
        is_downloadable: true,
        file_url: 'https://res.cloudinary.com/demo/file.pdf',
        file_name: 'Unit1_Lecture_Notes.pdf',
        content_type: 'PDF',
        class_subject_id: mockClassSubjectId,
        classSubject: { class_id: mockClassId },
      });

      const download = await studentContentService.getAuthorizedDownload(
        mockContentId,
        studentContext
      );

      expect(download.fileUrl).toBe('https://res.cloudinary.com/demo/file.pdf');
      expect(download.fileName).toBe('Unit1_Lecture_Notes.pdf');
    });
  });

  // ==========================================
  // 3. ML FEATURE STORE & ANALYTICS
  // ==========================================
  describe('ML Feature Engine & Faculty Analytics', () => {
    it('computes ML engagement scores, completion rates, and risk classification', async () => {
      (prisma.classSubject.findUnique as any).mockResolvedValue({
        id: mockClassSubjectId,
        class_id: mockClassId,
      });

      (prisma.learningContent.findMany as any).mockResolvedValue([
        { id: 'c1', content_type: 'VIDEO', duration_seconds: 600 },
        { id: 'c2', content_type: 'PDF', duration_seconds: 0 },
      ]);

      (prisma.studentContentProgress.findMany as any).mockResolvedValue([
        { content_id: 'c1', watch_time_seconds: 550, completion_percentage: 95, is_completed: true, rewind_count: 2 },
        { content_id: 'c2', watch_time_seconds: 0, completion_percentage: 100, is_completed: true, rewind_count: 0 },
      ]);

      (prisma.assignment.findMany as any).mockResolvedValue([]);

      await AnalyticsFeatureEngine.recalculateStudentFeatures(mockStudentUid, mockClassSubjectId);

      expect(prisma.studentSubjectFeature.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            student_uid_class_subject_id: {
              student_uid: mockStudentUid,
              class_subject_id: mockClassSubjectId,
            },
          },
          create: expect.objectContaining({
            overall_completion_rate: 100,
            risk_level: 'LOW',
          }),
        })
      );
    });

    it('generates class-wide analytics with video drop-off distributions', async () => {
      (prisma.classSubject.findFirst as any).mockResolvedValue({
        id: mockClassSubjectId,
        class_id: mockClassId,
        class: { name: 'CSE - Final Year' },
        subject: { name: 'Advanced Machine Learning', code: 'CS801' },
      });

      (prisma.authedUser.findMany as any).mockResolvedValue([
        { uid: 's1', display_name: 'Alice', email: 'alice@clg.edu', register_number: 'CS01' },
        { uid: 's2', display_name: 'Bob', email: 'bob@clg.edu', register_number: 'CS02' },
      ]);

      (prisma.learningContent.findMany as any).mockResolvedValue([
        { id: 'c1', title: 'Deep CNNs', content_type: 'VIDEO', duration_seconds: 1200 },
      ]);

      (prisma.studentContentProgress.findMany as any).mockResolvedValue([
        { student_uid: 's1', content_id: 'c1', watch_time_seconds: 1200, completion_percentage: 100, is_completed: true, rewind_count: 1 },
        { student_uid: 's2', content_id: 'c1', watch_time_seconds: 200, completion_percentage: 20, is_completed: false, rewind_count: 0 },
      ]);

      (prisma.studentSubjectFeature.findMany as any).mockResolvedValue([
        { student_uid: 's1', engagement_score: 95, risk_level: 'LOW' },
        { student_uid: 's2', engagement_score: 30, risk_level: 'HIGH' },
      ]);

      const analytics = await facultyAnalyticsService.getClassSubjectAnalytics(
        mockClassSubjectId,
        mockFacultyUid
      );

      expect(analytics.summary.totalStudents).toBe(2);
      expect(analytics.summary.riskDistribution.low).toBe(1);
      expect(analytics.summary.riskDistribution.high).toBe(1);
      expect(analytics.summary.videoDropoff.completed).toBe(1);
      expect(analytics.summary.videoDropoff.under25).toBe(1);
    });
  });

  // ==========================================
  // 4. VERSIONED ASSIGNMENT SUBMISSIONS & GRADING
  // ==========================================
  describe('Versioned Assignment Submissions & Grading', () => {
    it('records grade, grade points, and feedback for a student submission', async () => {
      (prisma.studentSubmission.findUnique as any).mockResolvedValue({
        id: 'sub-1',
        assignment: { class_subject_id: mockClassSubjectId, max_points: 100 },
        versions: [{ id: 'v1', version_number: 1 }],
      });

      (prisma.classSubject.findFirst as any).mockResolvedValue({
        id: mockClassSubjectId,
        faculty_uid: mockFacultyUid,
      });

      (prisma.studentSubmission.update as any).mockResolvedValue({
        id: 'sub-1',
        grade: 'A',
        status: 'GRADED',
      });

      (prisma.submissionVersion.update as any).mockResolvedValue({
        id: 'v1',
        grade: 'A',
        grade_points: 95,
        feedback: 'Excellent derivations and code clarity!',
      });

      const graded = await facultyContentService.gradeSubmission(
        'sub-1',
        { grade: 'A', gradePoints: 95, feedback: 'Excellent derivations and code clarity!' },
        mockFacultyUid
      );

      expect(graded.grade).toBe('A');
      expect(prisma.studentSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({
            grade: 'A',
            status: 'GRADED',
          }),
        })
      );
      expect(prisma.submissionVersion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v1' },
          data: expect.objectContaining({
            grade_points: 95,
            feedback: 'Excellent derivations and code clarity!',
          }),
        })
      );
    });
  });
});
