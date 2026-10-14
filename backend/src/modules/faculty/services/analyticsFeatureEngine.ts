import prisma from '../../../config/database';
import { logger } from '../../../utils/logger';

export class AnalyticsFeatureEngine {
  /**
   * Recalculates and upserts ML-ready feature vector for a student in a specific class-subject.
   */
  public static async recalculateStudentFeatures(studentUid: string, classSubjectId: string): Promise<void> {
    try {
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: classSubjectId },
        select: { class_id: true },
      });

      if (!classSubject) return;

      // 1. Get all published learning contents for this class-subject
      const contents = await prisma.learningContent.findMany({
        where: { class_subject_id: classSubjectId, is_published: true },
        select: { id: true, content_type: true, duration_seconds: true },
      });

      const totalContentsCount = contents.length;
      const videoContents = contents.filter(c => c.content_type === 'VIDEO' || c.content_type === 'YOUTUBE');

      // 2. Get student's progress records for this class-subject
      const progressRecords = await prisma.studentContentProgress.findMany({
        where: { student_uid: studentUid, class_subject_id: classSubjectId },
      });

      let totalWatchSeconds = 0;
      let completedContentsCount = 0;
      let totalRewindCount = 0;
      let totalVideoCompletionSum = 0;

      for (const rec of progressRecords) {
        totalWatchSeconds += rec.watch_time_seconds || 0;
        totalRewindCount += rec.rewind_count || 0;
        if (rec.is_completed) {
          completedContentsCount++;
        }

        const isVideo = videoContents.some(v => v.id === rec.content_id);
        if (isVideo) {
          totalVideoCompletionSum += Math.min(100, rec.completion_percentage || 0);
        }
      }

      const overallCompletionRate = totalContentsCount > 0
        ? Math.round((completedContentsCount / totalContentsCount) * 100 * 10) / 10
        : 0;

      const avgVideoCompletionRate = videoContents.length > 0
        ? Math.round((totalVideoCompletionSum / videoContents.length) * 10) / 10
        : 0;

      const rewindFrequency = progressRecords.length > 0
        ? Math.round((totalRewindCount / progressRecords.length) * 10) / 10
        : 0;

      // 3. Assignment metrics
      const assignments = await prisma.assignment.findMany({
        where: { class_subject_id: classSubjectId },
        select: { id: true, due_date: true, max_points: true },
      });

      const totalAssignmentsCount = assignments.length;
      let submittedAssignmentsCount = 0;
      let onTimeCount = 0;
      let totalGradePoints = 0;
      let gradedCount = 0;

      if (totalAssignmentsCount > 0) {
        const assignmentIds = assignments.map(a => a.id);
        const submissions = await prisma.studentSubmission.findMany({
          where: {
            student_uid: studentUid,
            assignment_id: { in: assignmentIds },
          },
          include: {
            assignment: { select: { due_date: true } },
            versions: { orderBy: { version_number: 'desc' }, take: 1 },
          },
        });

        submittedAssignmentsCount = submissions.length;

        for (const sub of submissions) {
          const latestVersion = sub.versions[0];
          const isLate = sub.is_late ?? (sub.assignment?.due_date && sub.submitted_at ? sub.submitted_at > sub.assignment.due_date : false);
          if (!isLate) {
            onTimeCount++;
          }

          const gradePts = latestVersion?.grade_points ?? (sub.grade ? parseFloat(sub.grade) : null);
          if (gradePts !== null && !isNaN(gradePts)) {
            totalGradePoints += gradePts;
            gradedCount++;
          }
        }
      }

      const assignmentSubmissionRate = totalAssignmentsCount > 0
        ? Math.round((submittedAssignmentsCount / totalAssignmentsCount) * 100 * 10) / 10
        : 100; // If no assignments yet, don't penalize

      const onTimeSubmissionRate = submittedAssignmentsCount > 0
        ? Math.round((onTimeCount / submittedAssignmentsCount) * 100 * 10) / 10
        : 100;

      const avgAssignmentGrade = gradedCount > 0
        ? Math.round((totalGradePoints / gradedCount) * 10) / 10
        : 0;

      // 4. ML Composite Engagement Score (0 - 100 scale)
      // Weighted: 35% overall content completion, 25% video completion, 30% assignment submission, 10% on-time submission
      const engagementScore = Math.round(
        (overallCompletionRate * 0.35) +
        (avgVideoCompletionRate * 0.25) +
        (assignmentSubmissionRate * 0.30) +
        (onTimeSubmissionRate * 0.10)
      );

      // 5. ML Risk Level Classification
      let riskLevel = 'LOW';
      if (engagementScore < 40 || (totalContentsCount > 2 && overallCompletionRate < 25) || (totalAssignmentsCount > 0 && assignmentSubmissionRate < 35)) {
        riskLevel = 'HIGH';
      } else if (engagementScore < 70 || overallCompletionRate < 60) {
        riskLevel = 'MEDIUM';
      }

      // 6. Upsert to student_subject_features
      await prisma.studentSubjectFeature.upsert({
        where: {
          student_uid_class_subject_id: {
            student_uid: studentUid,
            class_subject_id: classSubjectId,
          },
        },
        create: {
          student_uid: studentUid,
          class_subject_id: classSubjectId,
          class_id: classSubject.class_id,
          total_watch_seconds: totalWatchSeconds,
          total_active_seconds: totalWatchSeconds,
          completed_contents_count: completedContentsCount,
          total_contents_count: totalContentsCount,
          overall_completion_rate: overallCompletionRate,
          rewind_frequency: rewindFrequency,
          avg_video_completion_rate: avgVideoCompletionRate,
          assignment_submission_rate: assignmentSubmissionRate,
          avg_assignment_grade: avgAssignmentGrade,
          on_time_submission_rate: onTimeSubmissionRate,
          engagement_score: engagementScore,
          risk_level: riskLevel,
          last_activity_at: new Date(),
        },
        update: {
          total_watch_seconds: totalWatchSeconds,
          total_active_seconds: totalWatchSeconds,
          completed_contents_count: completedContentsCount,
          total_contents_count: totalContentsCount,
          overall_completion_rate: overallCompletionRate,
          rewind_frequency: rewindFrequency,
          avg_video_completion_rate: avgVideoCompletionRate,
          assignment_submission_rate: assignmentSubmissionRate,
          avg_assignment_grade: avgAssignmentGrade,
          on_time_submission_rate: onTimeSubmissionRate,
          engagement_score: engagementScore,
          risk_level: riskLevel,
          last_activity_at: new Date(),
          updated_at: new Date(),
        },
      });
    } catch (err: any) {
      logger.error('Failed to recalculate student features:', { error: err.message, studentUid, classSubjectId });
    }
  }
}
