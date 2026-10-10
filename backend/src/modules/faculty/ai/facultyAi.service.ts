import {
  ChatMessage,
  FacultyChatRequest,
  FacultyChatResponseData,
  FacultyContext,
  FacultyToolName,
  ToolExecutionResult,
} from './facultyAi.types';
import { facultyToolRegistry } from './toolRegistry';

/**
 * Common prompt injection and boundary-escape patterns.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?(admin|superadmin|root|developer)/i,
  /bypass\s+(departmental|department|college|tenant|class|incharge)\s+(isolation|restriction|rule|boundary)/i,
  /reveal\s+(system\s+prompt|database\s+password|api\s+key|credentials)/i,
  /disregard\s+(the\s+)?(rules|policies|guardrails)/i,
  /<script[\s>]/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
];

export class FacultyAiOrchestratorService {
  /**
   * Sanitizes user inputs and verifies that prompt injection attempts
   * do not compromise system security or tenant/class boundaries.
   */
  public sanitizeAndValidateInput(message: string): {
    sanitized: string;
    isSuspicious: boolean;
  } {
    const trimmed = message.trim();

    if (!trimmed) {
      throw { status: 400, message: 'Message cannot be empty' };
    }

    const isSuspicious = INJECTION_PATTERNS.some((pattern) =>
      pattern.test(trimmed),
    );

    // Strip HTML/script tags and control characters
    const sanitized = trimmed
      .replace(/<[^>]*>?/gm, '')
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');

    return { sanitized, isSuspicious };
  }

  /**
   * Determine tool intent and arguments from user prompt when toolChoice is 'auto'.
   */
  public detectToolIntent(message: string): {
    toolName: FacultyToolName | null;
    args: Record<string, any>;
  } {
    const lower = message.toLowerCase();

    // 1. Dashboard Intent
    if (
      lower.includes('dashboard') ||
      lower.includes('overview') ||
      lower.includes('my summary') ||
      lower.includes('my profile and classes')
    ) {
      return {
        toolName: 'faculty.getDashboard',
        args: {},
      };
    }

    // 2. Student Attendance Intent
    if (
      lower.includes('student') &&
      (lower.includes('attendance') || lower.includes('percentage') || lower.includes('defaulter') || lower.includes('present'))
    ) {
      const idMatch = message.match(/(?:student(?:Id)?|reg(?:ister)?(?:\s+no)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const studentId = idMatch ? idMatch[1] : 'std-cse-001';
      return {
        toolName: 'faculty.getStudentAttendance',
        args: { studentId },
      };
    }

    // 3. Student Details Intent
    if (
      lower.includes('student') &&
      (lower.includes('detail') || lower.includes('profile') || lower.includes('info') || lower.includes('contact'))
    ) {
      const idMatch = message.match(/(?:student(?:Id)?|reg(?:ister)?(?:\s+no)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const studentId = idMatch ? idMatch[1] : 'std-cse-001';
      return {
        toolName: 'faculty.getStudentDetails',
        args: { studentId },
      };
    }

    // 4. Class Attendance Stats Intent
    if (
      (lower.includes('class') || lower.includes('batch')) &&
      (lower.includes('attendance stats') || lower.includes('attendance summary') || lower.includes('attendance rate') || lower.includes('defaulters in class'))
    ) {
      const classMatch = message.match(/(?:class(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const classId = classMatch ? classMatch[1] : 'cls-cse-3a';
      return {
        toolName: 'faculty.getClassAttendanceStats',
        args: { classId },
      };
    }

    // 5. Class Attendance History Intent
    if (
      (lower.includes('attendance') || lower.includes('session')) &&
      (lower.includes('history') || lower.includes('past sessions') || lower.includes('logs'))
    ) {
      const classMatch = message.match(/(?:class(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const classId = classMatch ? classMatch[1] : 'cls-cse-3a';
      return {
        toolName: 'faculty.getClassAttendanceHistory',
        args: { classId, limit: 10 },
      };
    }

    // 6. Class Students Intent
    if (
      lower.includes('class') &&
      (lower.includes('students') || lower.includes('roll') || lower.includes('roster') || lower.includes('enrolled'))
    ) {
      const classMatch = message.match(/(?:class(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const classId = classMatch ? classMatch[1] : 'cls-cse-3a';
      return {
        toolName: 'faculty.getClassStudents',
        args: { classId },
      };
    }

    // 7. Class Details Intent
    if (
      lower.includes('class') &&
      (lower.includes('detail') || lower.includes('incharge') || lower.includes('representative') || lower.includes('rep'))
    ) {
      const classMatch = message.match(/(?:class(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const classId = classMatch ? classMatch[1] : 'cls-cse-3a';
      return {
        toolName: 'faculty.getClassDetails',
        args: { classId },
      };
    }

    // 8. Assigned Classes Intent
    if (
      lower.includes('my classes') ||
      lower.includes('assigned classes') ||
      lower.includes('which classes') ||
      lower.includes('classes i teach')
    ) {
      return {
        toolName: 'faculty.getAssignedClasses',
        args: { isActiveOnly: true },
      };
    }

    // 9. Class Master Timetable Intent
    if (
      (lower.includes('class') || lower.includes('section')) &&
      (lower.includes('timetable') || lower.includes('schedule') || lower.includes('periods'))
    ) {
      const classMatch = message.match(/(?:class(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const classId = classMatch ? classMatch[1] : 'cls-cse-3a';
      return {
        toolName: 'faculty.getClassTimetable',
        args: { classId },
      };
    }

    // 10. Faculty Teaching Timetable Intent
    if (
      lower.includes('my timetable') ||
      lower.includes('my schedule') ||
      lower.includes('my periods') ||
      lower.includes('when is my class') ||
      lower.includes('timetable today')
    ) {
      return {
        toolName: 'faculty.getTimetable',
        args: {},
      };
    }

    // 11. Reminders Intent
    if (
      lower.includes('reminder') ||
      lower.includes('task') ||
      lower.includes('deadline') ||
      lower.includes('todo') ||
      lower.includes('pending work')
    ) {
      return {
        toolName: 'faculty.getReminders',
        args: { status: 'PENDING' },
      };
    }

    // 12. Search Intent
    if (
      lower.startsWith('search') ||
      lower.startsWith('find') ||
      lower.startsWith('lookup')
    ) {
      const query = message.replace(/^(search|find|lookup)\s+(for\s+)?/i, '').trim() || 'CSE';
      return {
        toolName: 'faculty.search',
        args: { query },
      };
    }

    // 13. Department Info Intent
    if (
      lower.includes('department') ||
      lower.includes('dept') ||
      lower.includes('hod') ||
      lower.includes('head of department')
    ) {
      return {
        toolName: 'faculty.getDepartment',
        args: {},
      };
    }

    // 14. Subjects Intent
    if (
      lower.includes('subjects') ||
      lower.includes('courses') ||
      lower.includes('curriculum') ||
      lower.includes('syllabus')
    ) {
      const semMatch = message.match(/semester\s*(\d+)/i);
      return {
        toolName: 'faculty.getSubjects',
        args: semMatch ? { semesterNumber: parseInt(semMatch[1], 10) } : {},
      };
    }

    // 15. Academic Years Intent
    if (lower.includes('academic year') || lower.includes('session')) {
      return {
        toolName: 'faculty.getAcademicYears',
        args: {},
      };
    }

    // 16. Semesters Intent
    if (lower.includes('semester dates') || lower.includes('term dates')) {
      return {
        toolName: 'faculty.getSemesters',
        args: {},
      };
    }

    // 17. Performance Intent
    if (
      lower.includes('performance') ||
      lower.includes('marks') ||
      lower.includes('average score') ||
      lower.includes('pass percentage') ||
      lower.includes('exam results')
    ) {
      return {
        toolName: 'faculty.getPerformance',
        args: {},
      };
    }

    // 18. Policy / Regulation / Knowledge Intent
    if (
      lower.includes('policy') ||
      lower.includes('regulation') ||
      lower.includes('condonation') ||
      lower.includes('rule') ||
      lower.includes('handbook') ||
      lower.includes('guidelines')
    ) {
      return {
        toolName: 'faculty.searchKnowledge',
        args: { query: message, category: 'ALL', topK: 3 },
      };
    }

    return { toolName: null, args: {} };
  }

  /**
   * Synthesize a structured response based on user input, intent, and tool output.
   */
  public synthesizeResponse(
    message: string,
    toolsExecuted: ToolExecutionResult[],
    context: FacultyContext,
  ): string {
    if (toolsExecuted.length === 0) {
      return (
        `Hello ${context.displayName || 'Professor'}! I am your Faculty & Class Incharge AI Assistant.\n\n` +
        `I can assist you with:\n` +
        `- **Class Incharge Surveillance:** View assigned classes, students, and class attendance statistics.\n` +
        `- **Student Monitoring:** Check individual attendance percentages, defaulter status, and contact info.\n` +
        `- **Schedules & Sessions:** Inspect your teaching timetable and class master timetables.\n` +
        `- **Academic Operations:** Track pending reminders, exam marks, and subjects.\n` +
        `- **Institutional Knowledge:** Lookup attendance policy, condonation criteria, and regulations.\n\n` +
        `How may I assist you with your academic duties today?`
      );
    }

    const firstTool = toolsExecuted[0];
    if (firstTool.status === 'error') {
      return (
        `⚠️ **Tool Execution Error:**\n\n` +
        `I encountered an issue executing \`${firstTool.toolName}\`: ${firstTool.error?.message || 'Unknown error'}.\n\n` +
        `Please check the input arguments or verify that your Faculty account has the required access.`
      );
    }

    const res = firstTool.result;

    switch (firstTool.toolName) {
      case 'faculty.getDashboard':
        return (
          `### 📋 Faculty Overview: ${res.faculty.name}\n\n` +
          `- **Designation:** ${res.faculty.designation}\n` +
          `- **Department:** ${res.department?.name || 'Department'} (${res.department?.code || ''})\n` +
          `- **Class Incharge Responsibility:** ${res.classIncharge.isAssigned ? `Active (${res.classIncharge.class?.name || 'Assigned'})` : 'None'}\n` +
          `- **Primary Teaching Subject:** ${res.assignedSubject?.name ? `${res.assignedSubject.name} (${res.assignedSubject.code})` : 'None assigned'}\n` +
          `- **Current Academic Session:** ${res.academicYear?.name || '2026-2027'} — Semester ${res.semester?.termNumber || 5}\n\n` +
          `You have **${res.assignedSubjects?.length || 0}** active course allocations for this term.`
        );

      case 'faculty.getAssignedClasses':
        return (
          `### 🏫 Assigned Classes (${res.total})\n\n` +
          res.classes
            .map(
              (c: any) =>
                `- **${c.name}** (${c.program || 'Program'}): ${c.studentCount} students enrolled. Role: *${c.inchargeFaculty.name}*`,
            )
            .join('\n') +
          `\n\nUse \`show details for <className>\` to view class representatives and attendance records.`
        );

      case 'faculty.getClassDetails':
        return (
          `### 🏫 Class Details: ${res.name}\n\n` +
          `- **Program & Batch:** ${res.program} (Batch ${res.batch || 'Current'})\n` +
          `- **Current Semester:** Semester ${res.currentSemester}\n` +
          `- **Enrolled Students:** ${res.studentCount}\n` +
          `- **Class Representative (CR):** ${res.classRep ? `${res.classRep.name} (${res.classRep.registerNumber || res.classRep.email})` : 'Not assigned'}\n` +
          `- **Average Attendance:** ${res.overallAttendance ? `${res.overallAttendance}%` : 'N/A'}\n` +
          `- **Overall Academic Performance:** ${res.overallPerformance || 'Satisfactory'}`
        );

      case 'faculty.getClassStudents':
        return (
          `### 👥 Enrolled Students in Class (Total: ${res.total})\n\n` +
          res.students
            .map(
              (s: any) =>
                `- **${s.name}** (${s.registerNumber || s.email}): Attendance: **${s.attendancePercentage}%** | Grade: **${s.performanceGrade || 'N/A'}**${s.isClassRep ? ' ⭐ [CR]' : ''}`,
            )
            .join('\n') +
          `\n\nAsk for detailed profiles using \`student details for <registerNumber>\`.`
        );

      case 'faculty.getStudentDetails':
        return (
          `### 👤 Student Profile: ${res.displayName}\n\n` +
          `- **Register Number:** ${res.registerNumber || 'N/A'}\n` +
          `- **Class:** ${res.className}\n` +
          `- **Email:** ${res.email}\n` +
          `- **Phone:** ${res.phone || 'N/A'}\n` +
          `- **Account Status:** ${res.accountStatus}\n` +
          `- **Enrollment Year:** ${res.enrollmentYear || '2023'}`
        );

      case 'faculty.getStudentAttendance':
        return (
          `### 📊 Attendance Record: ${res.studentName} (${res.registerNumber || 'N/A'})\n\n` +
          `- **Class:** ${res.className}\n` +
          `- **Overall Attendance Percentage:** **${res.overallPercentage}%** ${res.isDefaulter ? '⚠️ **[SHORTAGE ALERT - BELOW 75%]**' : '✅ [SATISFACTORY]'}\n` +
          `- **Total Sessions Conducted:** ${res.totalSessions}\n` +
          `- **Present:** ${res.presentSessions} | **Absent:** ${res.absentSessions}\n\n` +
          `**Recent Sessions:**\n` +
          res.recentSessions
            .map((s: any) => `- ${s.date} [${s.period}]: ${s.subjectName} — **${s.status}**`)
            .join('\n')
        );

      case 'faculty.getClassAttendanceStats':
        return (
          `### 📈 Attendance Statistics: ${res.className}\n\n` +
          `- **Total Enrolled Students:** ${res.totalStudents}\n` +
          `- **Class Average Attendance:** **${res.averageAttendancePercentage}%**\n` +
          `- **Total Sessions Conducted:** ${res.totalSessionsConducted}\n` +
          `- **Attendance Shortage (<75%):** ${res.defaultersCount} students\n` +
          `- **Good Attendance (≥75%):** ${res.goodAttendanceCount} students`
        );

      case 'faculty.getClassAttendanceHistory':
        return (
          `### 📅 Attendance Sessions History: Class ${res.classId}\n\n` +
          res.sessions
            .map(
              (s: any) =>
                `- **${s.date}** (${s.period}): ${s.subjectName} — Present: ${s.totalPresent}, Absent: ${s.totalAbsent} (**${s.attendancePercentage}%**)`,
            )
            .join('\n')
        );

      case 'faculty.getClassTimetable':
        return (
          `### 🗓️ Class Master Timetable (Total Slots: ${res.totalSlots})\n\n` +
          res.timetable
            .map(
              (t: any) =>
                `- Day ${t.dayOfWeek}, Period ${t.period} (${t.startTime}-${t.endTime}): **${t.subjectName}** (${t.subjectCode}) — Faculty: *${t.facultyName}* [${t.roomNumber || 'Room TBA'}]`,
            )
            .join('\n')
        );

      case 'faculty.getTimetable':
        return (
          `### 🗓️ Your Personal Teaching Schedule (${res.totalSlots} Slots)\n\n` +
          res.slots
            .map(
              (t: any) =>
                `- Day ${t.dayOfWeek}, Period ${t.period} (${t.startTime}-${t.endTime}): **${t.subjectName}** for class **${t.className}** [${t.roomNumber || 'Room TBA'}]`,
            )
            .join('\n')
        );

      case 'faculty.getReminders':
        return (
          `### 🔔 Academic Reminders & Tasks (${res.pendingCount} Pending)\n\n` +
          res.reminders
            .map(
              (r: any) =>
                `- **[${r.priority}]** ${r.title}${r.dueDate ? ` (Due: ${r.dueDate} ${r.dueTime || ''})` : ''} — *${r.status}*`,
            )
            .join('\n')
        );

      case 'faculty.search':
        return (
          `### 🔍 Search Results for: "${res.query}"\n\n` +
          `- **Students Found:** ${res.students.length}\n` +
          res.students.map((s: any) => `  - ${s.name} (${s.registerNumber || 'N/A'}) - ${s.className}`).join('\n') +
          `\n- **Classes Found:** ${res.classes.length}\n` +
          res.classes.map((c: any) => `  - ${c.name} (${c.studentCount} students)`).join('\n') +
          `\n- **Subjects Found:** ${res.subjects.length}\n` +
          res.subjects.map((s: any) => `  - ${s.name} (${s.code})`).join('\n')
        );

      case 'faculty.getDepartment':
        return (
          `### 🏛️ Department Information: ${res.name} (${res.code})\n\n` +
          `- **College:** ${res.collegeName || 'N/A'}\n` +
          `- **Head of Department (HOD):** ${res.hodName || 'HOD Office'}\n` +
          `- **Total Curriculum Subjects:** ${res.subjectsCount}\n` +
          `- **Academic Programs:**\n` +
          res.programs.map((p: any) => `  - ${p.name} (${p.type || 'UG'}, ${p.durationYears} Years)`).join('\n')
        );

      case 'faculty.getSubjects':
        return (
          `### 📚 Department Subjects (${res.total})\n\n` +
          res.subjects
            .map((s: any) => `- **${s.name}** (\`${s.code}\`): ${s.credits} Credits, Semester ${s.semesterNumber}`)
            .join('\n')
        );

      case 'faculty.getAcademicYears':
        return (
          `### 📆 Institutional Academic Years\n\n` +
          res.academicYears
            .map((ay: any) => `- **${ay.name}**: ${ay.startDate.slice(0, 10)} to ${ay.endDate.slice(0, 10)} ${ay.isCurrent ? '⭐ [CURRENT]' : ''}`)
            .join('\n')
        );

      case 'faculty.getSemesters':
        return (
          `### 📅 Academic Semesters\n\n` +
          res.semesters
            .map((s: any) => `- **Semester ${s.termNumber}** (${s.academicYearName}): ${s.startDate.slice(0, 10)} to ${s.endDate.slice(0, 10)} ${s.isCurrent ? '⭐ [CURRENT]' : ''}`)
            .join('\n')
        );

      case 'faculty.getPerformance':
        return (
          `### 📊 Academic Performance Overview\n\n` +
          res.performances
            .map(
              (p: any) =>
                `- **${p.subjectName}** (${p.className}): Class Average: **${p.averageScore}%** | Pass Rate: **${p.passPercentage}%** (Highest: ${p.highestScore}, Lowest: ${p.lowestScore})`,
            )
            .join('\n')
        );

      case 'faculty.searchKnowledge':
        return (
          `### 📖 Institutional Knowledge & Policy Search: "${res.query}"\n\n` +
          res.results
            .map(
              (k: any, i: number) =>
                `**${i + 1}. ${k.title}** [Category: \`${k.category}\`]\n>${k.snippet}\n`,
            )
            .join('\n')
        );

      case 'faculty.getKnowledgeContext':
        return (
          `### 📜 Academic Regulation Context: ${res.topic}\n\n` +
          `>${res.contextText}\n\n` +
          `**Citations:**\n` +
          res.citations.map((c: string) => `- ${c}`).join('\n')
        );

      default:
        return `Execution of tool \`${firstTool.toolName}\` completed successfully.`;
    }
  }

  /**
   * Main entry point to process a chat request from an authenticated faculty member.
   */
  public async processChat(
    request: FacultyChatRequest,
    context: FacultyContext,
  ): Promise<FacultyChatResponseData> {
    const { sanitized, isSuspicious } = this.sanitizeAndValidateInput(request.message);

    if (isSuspicious) {
      return {
        message:
          'Security Notice: Prompt injection or security boundary violation attempt detected. ' +
          'All operations within the College LMS Faculty Orchestrator are strictly bound to verified departmental and class access rules.',
        toolsExecuted: [],
        metadata: {
          facultyUid: context.uid,
          departmentId: context.departmentId,
          collegeId: context.collegeId,
          timestamp: new Date().toISOString(),
          model: 'lms-faculty-ai-orchestrator-v1',
        },
      };
    }

    const toolsExecuted: ToolExecutionResult[] = [];
    const choice = request.toolChoice || 'auto';

    if (choice === 'none') {
      const responseText = this.synthesizeResponse(sanitized, [], context);
      return {
        message: responseText,
        toolsExecuted: [],
        metadata: {
          facultyUid: context.uid,
          departmentId: context.departmentId,
          collegeId: context.collegeId,
          timestamp: new Date().toISOString(),
          model: 'lms-faculty-ai-orchestrator-v1',
        },
      };
    }

    if (typeof choice === 'object' && choice.type === 'tool') {
      // Explicit Tool Choice
      const targetToolName = choice.name || (choice as any).toolName;
      if (targetToolName) {
        const execResult = await facultyToolRegistry.executeTool(
          targetToolName,
          {},
          context,
        );
        toolsExecuted.push(execResult);
      }
    } else {
      // Auto Intent Detection
      const { toolName, args } = this.detectToolIntent(sanitized);
      if (toolName) {
        const execResult = await facultyToolRegistry.executeTool(
          toolName,
          args,
          context,
        );
        toolsExecuted.push(execResult);
      }
    }

    const responseMessage = this.synthesizeResponse(
      sanitized,
      toolsExecuted,
      context,
    );

    return {
      message: responseMessage,
      toolsExecuted,
      metadata: {
        facultyUid: context.uid,
        departmentId: context.departmentId,
        collegeId: context.collegeId,
        timestamp: new Date().toISOString(),
        model: 'lms-faculty-ai-orchestrator-v1',
      },
    };
  }
}

export const facultyAiOrchestratorService = new FacultyAiOrchestratorService();
