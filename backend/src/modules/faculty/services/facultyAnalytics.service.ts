import prisma from '../../../config/database';
import { AppError } from '../../../utils/errors';

export class FacultyAnalyticsService {
  private async verifyFacultyAccess(facultyUid: string, classSubjectId: string) {
    if (!classSubjectId || typeof classSubjectId !== 'string' || !classSubjectId.trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'A valid classSubjectId is required.');
    }

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
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to analytics for this class subject.');
    }

    return classSubject;
  }

  /**
   * Get class-wide analytics overview for a specific ClassSubject
   */
  async getClassSubjectAnalytics(classSubjectId: string, facultyUid: string) {
    const classSubject = await this.verifyFacultyAccess(facultyUid, classSubjectId);

    // 1. Get all enrolled students in the class
    const students = await prisma.authedUser.findMany({
      where: {
        class_id: classSubject.class_id,
        role: 'STUDENT',
        approval_status: { in: ['APPROVED', 'ACTIVE'] },
      },
      select: {
        uid: true,
        display_name: true,
        email: true,
        register_number: true,
        photo_url: true,
      },
      orderBy: { register_number: 'asc' },
    });

    const totalStudents = students.length;

    // 2. Get all published learning contents
    const contents = await prisma.learningContent.findMany({
      where: {
        class_subject_id: classSubjectId,
        is_published: true,
      },
      include: {
        topic: { select: { title: true } },
      },
      orderBy: { order_index: 'asc' },
    });

    const totalContents = contents.length;
    const contentIds = contents.map(c => c.id);

    // 3. Get all progress records
    const progressRecords = await prisma.studentContentProgress.findMany({
      where: {
        class_subject_id: classSubjectId,
        content_id: { in: contentIds },
      },
    });

    // 4. Get ML feature records
    const features = await prisma.studentSubjectFeature.findMany({
      where: { class_subject_id: classSubjectId },
    });

    // 5. Calculate class-level metrics
    let totalWatchSeconds = 0;
    let totalRewinds = 0;
    let totalSeeks = 0;
    let totalDownloads = 0;
    let completedItemCount = 0;

    const videoDropoff = {
      under25: 0,
      under50: 0,
      under75: 0,
      completed: 0,
    };

    for (const p of progressRecords) {
      totalWatchSeconds += p.watch_time_seconds || 0;
      totalRewinds += p.rewind_count || 0;
      totalSeeks += p.seek_count || 0;
      totalDownloads += p.download_count || 0;

      if (p.is_completed) {
        completedItemCount++;
      }

      const pct = p.completion_percentage || 0;
      if (pct < 25) videoDropoff.under25++;
      else if (pct < 50) videoDropoff.under50++;
      else if (pct < 75) videoDropoff.under75++;
      else videoDropoff.completed++;
    }

    const totalPossibleCompletions = totalStudents * Math.max(1, totalContents);
    const averageCompletionRate = totalPossibleCompletions > 0
      ? Math.round((completedItemCount / totalPossibleCompletions) * 100 * 10) / 10
      : 0;

    // 6. Content item performance summary
    const contentStats = contents.map(c => {
      const relatedProgress = progressRecords.filter(p => p.content_id === c.id);
      const viewsCount = relatedProgress.length;
      const completedCount = relatedProgress.filter(p => p.is_completed).length;
      const avgWatchSec = viewsCount > 0
        ? Math.round(relatedProgress.reduce((acc, p) => acc + p.watch_time_seconds, 0) / viewsCount)
        : 0;
      const avgCompletion = viewsCount > 0
        ? Math.round(relatedProgress.reduce((acc, p) => acc + p.completion_percentage, 0) / viewsCount)
        : 0;
      const rewinds = relatedProgress.reduce((acc, p) => acc + p.rewind_count, 0);

      return {
        id: c.id,
        title: c.title,
        contentType: c.content_type,
        topicTitle: c.topic?.title || 'General',
        durationSeconds: c.duration_seconds,
        viewsCount,
        completedCount,
        completionRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
        avgWatchSeconds: avgWatchSec,
        avgCompletionPercentage: avgCompletion,
        totalRewinds: rewinds,
      };
    });

    // 7. Student-wise engagement & risk table
    const studentTable = students.map(st => {
      const stProgress = progressRecords.filter(p => p.student_uid === st.uid);
      const stFeature = features.find(f => f.student_uid === st.uid);

      const completedCount = stProgress.filter(p => p.is_completed).length;
      const watchSec = stProgress.reduce((acc, p) => acc + p.watch_time_seconds, 0);
      const rewinds = stProgress.reduce((acc, p) => acc + p.rewind_count, 0);
      const completionRate = totalContents > 0
        ? Math.round((completedCount / totalContents) * 100)
        : 0;

      const engagementScore = stFeature?.engagement_score ?? completionRate;
      const riskLevel = stFeature?.risk_level ?? (completionRate < 35 ? 'HIGH' : completionRate < 70 ? 'MEDIUM' : 'LOW');

      return {
        studentUid: st.uid,
        name: st.display_name || 'Student',
        email: st.email,
        registerNumber: st.register_number || 'N/A',
        photoUrl: st.photo_url,
        completedContents: completedCount,
        totalContents,
        completionRate,
        watchTimeSeconds: watchSec,
        rewindCount: rewinds,
        engagementScore,
        riskLevel,
        lastActive: stFeature?.last_activity_at || null,
      };
    });

    // 8. Risk counts
    const riskDistribution = {
      low: studentTable.filter(s => s.riskLevel === 'LOW').length,
      medium: studentTable.filter(s => s.riskLevel === 'MEDIUM').length,
      high: studentTable.filter(s => s.riskLevel === 'HIGH').length,
    };

    return {
      classSubject: {
        id: classSubject.id,
        className: classSubject.class.name,
        subjectName: classSubject.subject.name,
        subjectCode: classSubject.subject.code,
      },
      summary: {
        totalStudents,
        totalContents,
        averageCompletionRate,
        totalWatchHours: Math.round((totalWatchSeconds / 3600) * 10) / 10,
        totalRewinds,
        totalSeeks,
        totalDownloads,
        riskDistribution,
        videoDropoff,
      },
      contentStats,
      studentTable,
    };
  }

  /**
   * Get detailed drill-down analytics for an individual student
   */
  async getStudentDrillDownAnalytics(classSubjectId: string, studentUid: string, facultyUid: string) {
    const classSubject = await this.verifyFacultyAccess(facultyUid, classSubjectId);

    // 1. Student details
    const student = await prisma.authedUser.findUnique({
      where: { uid: studentUid },
      select: {
        uid: true,
        display_name: true,
        email: true,
        register_number: true,
        photo_url: true,
      },
    });

    if (!student) {
      throw new AppError(404, 'NOT_FOUND', 'Student not found.');
    }

    // 2. All contents for this class-subject
    const contents = await prisma.learningContent.findMany({
      where: { class_subject_id: classSubjectId, is_published: true },
      include: { topic: { select: { id: true, title: true } } },
      orderBy: { order_index: 'asc' },
    });

    // 3. Student progress on each content
    const progressRecords = await prisma.studentContentProgress.findMany({
      where: {
        class_subject_id: classSubjectId,
        student_uid: studentUid,
      },
    });

    const contentProgressList = contents.map(c => {
      const p = progressRecords.find(item => item.content_id === c.id);
      return {
        contentId: c.id,
        title: c.title,
        contentType: c.content_type,
        topicTitle: c.topic?.title || 'General',
        durationSeconds: c.duration_seconds,
        isCompleted: p?.is_completed || false,
        completionPercentage: p?.completion_percentage || 0,
        watchTimeSeconds: p?.watch_time_seconds || 0,
        lastPositionSeconds: p?.last_position_seconds || 0,
        maxPositionSeconds: p?.max_position_seconds || 0,
        rewindCount: p?.rewind_count || 0,
        seekCount: p?.seek_count || 0,
        downloadCount: p?.download_count || 0,
        firstAccessedAt: p?.first_accessed_at || null,
        lastAccessedAt: p?.last_accessed_at || null,
        completedAt: p?.completed_at || null,
      };
    });

    // 4. Raw recent telemetry events (last 50)
    const recentEvents = await prisma.learningEvent.findMany({
      where: {
        class_subject_id: classSubjectId,
        student_uid: studentUid,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        content: { select: { title: true, content_type: true } },
      },
    });

    // 5. Versioned assignment submissions
    const assignments = await prisma.assignment.findMany({
      where: { class_subject_id: classSubjectId },
      include: {
        submissions: {
          where: { student_uid: studentUid },
          include: {
            versions: { orderBy: { version_number: 'desc' } },
          },
        },
      },
    });

    const assignmentHistory = assignments.map(a => {
      const sub = a.submissions[0];
      return {
        assignmentId: a.id,
        title: a.title,
        dueDate: a.due_date,
        maxPoints: a.max_points,
        submissionStatus: sub ? sub.status : 'NOT_SUBMITTED',
        isLate: sub?.is_late || false,
        submittedAt: sub?.submitted_at || null,
        grade: sub?.grade || null,
        feedback: sub?.feedback || null,
        gradedAt: sub?.graded_at || null,
        versions: sub?.versions.map(v => ({
          versionNumber: v.version_number,
          fileUrl: v.file_url,
          fileName: v.file_name,
          submittedAt: v.submitted_at,
          isLate: v.is_late,
          grade: v.grade,
          gradePoints: v.grade_points,
          feedback: v.feedback,
          studentNotes: v.student_notes,
        })) || [],
      };
    });

    // 6. ML Feature vector
    const featureRecord = await prisma.studentSubjectFeature.findUnique({
      where: {
        student_uid_class_subject_id: {
          student_uid: studentUid,
          class_subject_id: classSubjectId,
        },
      },
    });

    return {
      student,
      classSubject: {
        id: classSubject.id,
        className: classSubject.class.name,
        subjectName: classSubject.subject.name,
      },
      contentProgressList,
      recentEvents: recentEvents.map(e => ({
        id: e.id,
        contentTitle: e.content.title,
        contentType: e.content.content_type,
        eventType: e.event_type,
        positionSeconds: e.position_seconds,
        seekFrom: e.seek_from,
        seekTo: e.seek_to,
        playbackRate: e.playback_rate,
        createdAt: e.created_at,
        metadata: e.metadata,
      })),
      assignmentHistory,
      mlFeatures: featureRecord || null,
    };
  }
}

export const facultyAnalyticsService = new FacultyAnalyticsService();
