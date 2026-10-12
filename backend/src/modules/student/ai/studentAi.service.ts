import { AppError } from '../../../utils/errors';
import {
  StudentContext,
  ChatMessage,
  StudentChatRequest,
  StudentChatResponseData,
  StudentToolName,
  ToolExecutionResult,
} from './studentAi.types';
import { studentToolRegistry } from './toolRegistry';

/**
 * Common prompt injection, boundary-escape, and credential theft regex patterns.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?(admin|superadmin|root|developer|faculty|hod)/i,
  /bypass\s+(student|departmental|college|tenant)\s+(isolation|restriction|rule|boundary)/i,
  /reveal\s+(system\s+prompt|database\s+password|api\s+key|credentials|secret)/i,
  /disregard\s+(the\s+)?(rules|policies|guardrails)/i,
  /<script[\s>]/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
  /show\s+(another|other)\s+student'?s?\s+attendance/i,
  /give\s+me\s+(the\s+)?database\s+password/i,
  /run\s+sql/i,
];

export class StudentAiOrchestratorService {
  /**
   * Sanitizes user inputs and verifies that prompt injection attempts
   * do not compromise system security or student boundaries.
   */
  public sanitizeAndValidateInput(message: string): {
    sanitized: string;
    isSuspicious: boolean;
  } {
    const trimmed = message.trim();

    if (!trimmed) {
      throw new AppError(400, 'BAD_REQUEST', 'Message cannot be empty');
    }

    const isSuspicious = INJECTION_PATTERNS.some((pattern) => pattern.test(trimmed));

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
    toolName: StudentToolName | null;
    args: Record<string, any>;
  } {
    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // 1. Pure Casual Greetings (Only short greeting phrases with no substantive query)
    const isPureGreeting =
      /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|who\s+are\s+you|what\s+can\s+you\s+do|help)\b[!?.]*$/i.test(
        trimmed,
      ) || (/^(hi|hello|hey)\b/i.test(trimmed) && trimmed.split(/\s+/).length <= 2);

    if (isPureGreeting) {
      return { toolName: null, args: {} };
    }

    // 2. Specific Document Context Intent (e.g., "doc-student-att-policy")
    if (
      (lower.includes('document') || lower.includes('clause') || lower.includes('section')) &&
      (message.includes('doc-') || message.includes('DOC-'))
    ) {
      const docMatch = message.match(/(?:doc(?:ument)?(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      return {
        toolName: 'student.getKnowledgeContext',
        args: {
          documentId: docMatch ? docMatch[1] : 'doc-student-att-policy',
        },
      };
    }

    // 3. Department & HOD Intent (PostgreSQL)
    if (
      lower.includes('hod') ||
      lower.includes('head of department') ||
      lower.includes('head of the department') ||
      lower.includes('department head') ||
      lower.includes('department') ||
      lower.includes('dept')
    ) {
      return {
        toolName: 'student.getDepartment',
        args: {},
      };
    }

    // 4. Class Incharge / Advisor / Mentor Intent (PostgreSQL)
    if (
      lower.includes('incharge') ||
      lower.includes('advisor') ||
      lower.includes('mentor') ||
      lower.includes('counselor') ||
      lower.includes('class teacher') ||
      lower.includes('in-charge')
    ) {
      return {
        toolName: 'student.getClassIncharge',
        args: {},
      };
    }

    // 5. Attendance Metrics & Schedule Intent (PostgreSQL)
    // Guard: if the query is about attendance *policy*, *condonation*, *rules*, or *regulations*,
    // let it fall through to the RAG knowledge search (step 15) instead.
    const isAttendancePolicyQuery =
      lower.includes('policy') ||
      lower.includes('condonation') ||
      lower.includes('rule') ||
      lower.includes('regulation') ||
      lower.includes('guideline');

    if (
      !isAttendancePolicyQuery &&
      (lower.includes('attendance') ||
        lower.includes('percentage') ||
        lower.includes('safe margin') ||
        lower.includes('bunk') ||
        lower.includes('miss class') ||
        lower.includes('eligible') ||
        lower.includes('shortage') ||
        lower.includes('absent') ||
        lower.includes('present'))
    ) {
      const dateMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      return {
        toolName: 'student.getAttendance',
        args: dateMatch ? { date: dateMatch[1] } : {},
      };
    }

    // 6. Timetable & Schedule Intent (PostgreSQL)
    if (
      lower.includes('timetable') ||
      lower.includes('schedule') ||
      lower.includes('period') ||
      lower.includes('routine') ||
      lower.includes('next class') ||
      lower.includes('today classes') ||
      lower.includes('today class') ||
      lower.includes('classes today')
    ) {
      return {
        toolName: 'student.getTimetable',
        args: {},
      };
    }

    // 7. Subjects / Courses Intent (PostgreSQL)
    if (
      lower.includes('subject') ||
      lower.includes('course') ||
      lower.includes('credits') ||
      lower.includes('syllabus')
    ) {
      const semMatch = message.match(/(?:semester|sem)\s*[:=]?\s*(\d+)/i);
      const semesterNumber = semMatch ? parseInt(semMatch[1], 10) : undefined;
      return {
        toolName: 'student.getSubjects',
        args: semesterNumber ? { semesterNumber } : {},
      };
    }

    // 8. Academic Years / Calendar Intent (PostgreSQL)
    if (lower.includes('academic year') || lower.includes('calendar')) {
      return {
        toolName: 'student.getAcademicYears',
        args: {},
      };
    }

    // 9. Semesters Intent (PostgreSQL)
    if (lower.includes('semester') && (lower.includes('date') || lower.includes('term') || lower.includes('start'))) {
      return {
        toolName: 'student.getSemesters',
        args: {},
      };
    }

    // 10. Student Profile / Identity Intent (PostgreSQL)
    if (
      lower.includes('profile') ||
      lower.includes('my info') ||
      lower.includes('register number') ||
      lower.includes('reg no') ||
      lower.includes('enrollment') ||
      lower.includes('who am i')
    ) {
      return {
        toolName: 'student.getProfile',
        args: {},
      };
    }

    // 11. Class / Section Intent (PostgreSQL)
    if (lower.includes('my class') || lower.includes('section')) {
      return {
        toolName: 'student.getClass',
        args: {},
      };
    }

    // 12. Batch Intent (PostgreSQL)
    if (lower.includes('batch') || lower.includes('graduation year')) {
      return {
        toolName: 'student.getBatch',
        args: {},
      };
    }

    // 13. Program / Degree Intent (PostgreSQL)
    if (lower.includes('program') || lower.includes('degree') || lower.includes('curriculum')) {
      return {
        toolName: 'student.getProgram',
        args: {},
      };
    }

    // 14. Academic Dashboard / Status Summary (PostgreSQL)
    if (lower.includes('dashboard') || lower.includes('summary') || lower.includes('overview') || lower.includes('academic status')) {
      return {
        toolName: 'student.getDashboard',
        args: {},
      };
    }

    // 15. All Other Academic, Institutional, Policy & Campus Inquiries -> Search RAG Vault in Qdrant!
    let category: string | undefined = undefined;
    if (lower.includes('exam') || lower.includes('mark') || lower.includes('grade') || lower.includes('arrear') || lower.includes('hall ticket') || lower.includes('revaluation')) {
      category = 'exam';
    } else if (lower.includes('dress') || lower.includes('uniform') || lower.includes('wear') || lower.includes('shirt') || lower.includes('shoe') || lower.includes('clothing') || lower.includes('attire') || lower.includes('saree') || lower.includes('jeans') || lower.includes('pant') || lower.includes('outfit')) {
      category = 'dress_code';
    } else if (lower.includes('discipline') || lower.includes('ragging') || lower.includes('misconduct') || lower.includes('penalty') || lower.includes('punishment')) {
      category = 'discipline';
    } else if (lower.includes('regulation') || lower.includes('bylaw') || lower.includes('cbcs') || lower.includes('passing criteria') || lower.includes('grading')) {
      category = 'regulation';
    } else if (lower.includes('handbook') || lower.includes('code of conduct')) {
      category = 'handbook';
    } else if (lower.includes('policy') || lower.includes('condonation') || lower.includes('leave') || lower.includes('medical') || lower.includes('scholarship') || lower.includes('fee')) {
      category = 'policy';
    }

    return {
      toolName: 'student.searchKnowledge',
      args: {
        query: trimmed.slice(0, 200),
        category: category || 'general',
        limit: 5,
      },
    };
  }

  /**
   * Synthesize a response based on executed tools and student context.
   * If Groq API key is present, optionally ground through Groq LLM.
   */
  public async synthesizeResponse(
    userMessage: string,
    toolsExecuted: ToolExecutionResult[],
    context: StudentContext,
    isSuspicious: boolean,
  ): Promise<{ reply: string; provider: 'groq' | 'local' }> {
    if (isSuspicious) {
      return {
        reply:
          `Security Notice: Your request contained patterns attempting to alter system guardrails, ` +
          `access other students' data, or bypass authorization boundaries. ` +
          `Your session is strictly restricted to your authorized Student identity (${context.email}). ` +
          `Arbitrary database operations and privilege escalation are strictly denied.`,
        provider: 'local',
      };
    }

    if (toolsExecuted.length === 0) {
      return {
        reply:
          `Hello ${context.displayName || 'Student'}! 👋\n\n` +
          `I am your official Student AI Academic Assistant. I can help you with:\n` +
          `- 📊 **Attendance Tracking:** Check your overall percentage, 75% exam eligibility, and safe margin.\n` +
          `- 📅 **Timetable & Schedule:** View your weekly class timetable and classroom venues.\n` +
          `- 📚 **Curriculum & Subjects:** Check your enrolled courses, faculty incharge, and credits.\n` +
          `- 📖 **Institutional Policies (RAG):** Search attendance condonation rules, passing criteria, and student regulations.\n\n` +
          `How can I assist you with your academics today?`,
        provider: 'local',
      };
    }

    const executed = toolsExecuted[0];

    // Check if error occurred in tool
    if (executed.status === 'error') {
      return {
        reply:
          `I attempted to retrieve information using **${executed.toolName}**, but encountered an error: ` +
          `"${executed.error?.message || 'Execution failed'}". Please verify your request or try again later.`,
        provider: 'local',
      };
    }

    // Try Groq LLM synthesis if configured
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey && !groqApiKey.startsWith('your-')) {
      try {
        const groqReply = await this.callGroqSynthesis(userMessage, executed, context);
        if (groqReply) {
          return { reply: groqReply, provider: 'groq' };
        }
      } catch (err: any) {
        console.warn(`[Student AI] Groq synthesis fallback to local: ${err?.message}`);
      }
    }

    // Deterministic High-Fidelity Formatting
    return {
      reply: this.formatLocalResponse(executed, context),
      provider: 'local',
    };
  }

  /**
   * Calls Groq completions API to synthesize a grounded student answer.
   */
  private async callGroqSynthesis(
    userMessage: string,
    executed: ToolExecutionResult,
    context: StudentContext,
  ): Promise<string | null> {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    const isTimetableEmpty =
      executed.toolName === 'student.getTimetable' &&
      (Array.isArray(executed.result) ? executed.result.length === 0 : !executed.result?.slots?.length);

    const isKnowledgeEmpty =
      executed.toolName === 'student.searchKnowledge' &&
      (!executed.result?.results || executed.result.results.length === 0);

    const systemPrompt =
      `You are an authoritative, helpful, and empathetic College LMS Student AI Academic Assistant. ` +
      `You are answering for student: ${context.displayName || 'Student'} (Register No: ${context.registerNumber || 'N/A'}). ` +
      `You MUST strictly base your answer ONLY on the provided verified database tool result. ` +
      `Never hallucinate, invent unverified numbers, or reveal database connection details. ` +
      `Present clear markdown formatting with emojis and bullet points for readability. ` +
      `MANDATORY DATABASE GROUNDING RULES:\n` +
      `1. TIMETABLE: If the timetable result has 0 slots or is empty, you MUST state explicitly that your Class Incharge has not yet published or provided the weekly class timetable in the portal. DO NOT invent, fabricate, or list any class periods, subjects, times, or rooms!\n` +
      `2. KNOWLEDGE & RAG: If no documents are found, state clearly that no official regulations or policies matching the query were found in your college's knowledge base.\n` +
      `3. ATTENDANCE & ACADEMICS: Strictly report only the numbers and statuses provided in the tool output. Never invent data.`;

    let promptContent =
      `User Question: ${userMessage}\n\n` +
      `Tool Executed: ${executed.toolName}\n` +
      `Verified Data Result from Database / RAG:\n${JSON.stringify(executed.result, null, 2)}\n\n`;

    if (isTimetableEmpty) {
      promptContent +=
        `DATABASE STATUS: The student's Class Incharge has NOT published the class timetable yet (0 records found in PostgreSQL). ` +
        `You MUST clearly state that no timetable has been published yet by their Class Incharge, and that it will appear once their Class Incharge enters it in the Faculty Portal. ` +
        `Do NOT create, hallucinate, or list any subjects, periods, or times.\n\n`;
    } else if (isKnowledgeEmpty) {
      promptContent +=
        `DATABASE STATUS: 0 policy documents were found in the college Qdrant vector database matching this search query. ` +
        `State that no official regulations matching the query are currently uploaded in the college RAG vault.\n\n`;
    } else if (executed.toolName === 'student.getClassIncharge' && executed.result?.name) {
      promptContent +=
        `PRESENTATION INSTRUCTION FOR CLASS INCHARGE / FACULTY:\n` +
        `- Highlight the faculty's full name with bold formatting: "### 👨‍🏫 **${executed.result.name}**"\n` +
        (executed.result.photoUrl ? `- Put their official photo directly on its own line: "![${executed.result.name} Photo](${executed.result.photoUrl})"\n` : '') +
        `- Clearly present their Designation, Department, Email with clickable mailto link, and Phone in clean bullet points.\n` +
        `- DO NOT place the photo URL inside a markdown table cell pipe syntax. Present clean, modern card-friendly markdown.\n\n`;
    } else if (executed.toolName === 'student.getDepartment') {
      const hod = executed.result?.hod;
      promptContent +=
        `PRESENTATION INSTRUCTION FOR DEPARTMENT & HOD:\n` +
        `- Highlight the Department name and code clearly: "### 🏛️ **${executed.result?.name || 'Department'} (${executed.result?.code || ''})**"\n` +
        (hod?.displayName
          ? `- Highlight the Head of Department (HOD) clearly: "### 👨‍💼 **${hod.displayName}** (Head of Department)"\n` +
            (hod.photoURL ? `- Put their official photo directly on its own line: "![${hod.displayName} Photo](${hod.photoURL})"\n` : '') +
            (hod.email ? `- Include HOD email with clickable mailto link: [${hod.email}](mailto:${hod.email})\n` : '')
          : `- Clearly inform the student that no Head of Department (HOD) is currently registered for this department in the portal database.\n`) +
        `- DO NOT place photo URLs inside markdown table cells. Present clean, executive card-friendly markdown.\n\n`;
    }

    promptContent += `Please provide a clear, supportive, and structured academic response.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptContent },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      // If gpt-oss-120b or endpoint returns error, try fallback model if needed
      return null;
    }

    const data = (await response.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    return content && typeof content === 'string' ? content.trim() : null;
  }

  /**
   * Deterministic local formatting for canonical tools
   */
  private formatLocalResponse(executed: ToolExecutionResult, context: StudentContext): string {
    const data = executed.result;

    switch (executed.toolName) {
      case 'student.getAttendance': {
        const sum = data.summary;
        const statusEmoji = sum.percentage >= 75 ? '✅' : '⚠️';
        const eligibilityText = sum.isEligible
          ? 'Eligible for Semester Examinations'
          : 'Shortage Alert — Below 75% Threshold';

        let res = `### 📊 Your Attendance Summary\n\n`;
        res += `- **Overall Attendance:** **${sum.percentage}%** ${statusEmoji} (${sum.attendedSessions}/${sum.totalSessions} sessions)\n`;
        res += `- **Status:** **${eligibilityText}**\n`;
        res += `- **Safe Margin:** **${sum.safeMargin >= 0 ? `${sum.safeMargin} session(s) can be safely missed` : `Need ${Math.abs(sum.safeMargin)} consecutive sessions to reach 75%`}**\n`;
        res += `- **Breakdown:** ${sum.presentCount} Present | ${sum.lateCount} Late | ${sum.absentCount} Absent | ${sum.excusedCount} Excused\n\n`;

        if (data.subjectBreakdown && data.subjectBreakdown.length > 0) {
          res += `**Subject Breakdown:**\n`;
          data.subjectBreakdown.forEach((s: any) => {
            const sBadge = s.percentage >= 75 ? '✅' : s.status === 'NO_DATA' ? 'ℹ️' : '⚠️';
            res += `• **${s.code} - ${s.name}:** ${s.percentage}% ${sBadge} (${s.attended}/${s.held} attended)\n`;
          });
        }
        return res;
      }

      case 'student.getTimetable': {
        const slots = Array.isArray(data) ? data : data?.slots || [];
        if (!slots || slots.length === 0) {
          return (
            `### 📅 Class Timetable\n\n` +
            `ℹ️ **No Weekly Time Table Provided Yet**\n\n` +
            `Your Class Incharge has not yet published or provided the weekly period schedule for your class in the portal.\n\n` +
            `Once your Class Incharge feeds the timetable in the Faculty Portal, the full period matrix and daily schedules will appear here automatically.`
          );
        }
        let res = `### 📅 Your Weekly Class Timetable\n\n`;
        const grouped: Record<string, any[]> = {};
        data.forEach((slot: any) => {
          const day = slot.day_of_week || 'Schedule';
          if (!grouped[day]) grouped[day] = [];
          grouped[day].push(slot);
        });

        Object.entries(grouped).forEach(([day, slots]) => {
          res += `**${day}:**\n`;
          slots.forEach((s) => {
            const time = s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : s.period;
            res += `• **${time}**: ${s.subject_name || s.subject_code} (${s.room || 'Room TBD'}) — ${s.faculty_name || 'Faculty'}\n`;
          });
          res += `\n`;
        });
        return res;
      }

      case 'student.getProfile': {
        return (
          `### 👤 Student Profile\n\n` +
          `- **Name:** ${data.displayName || 'Student'}\n` +
          `- **Email:** ${data.email}\n` +
          `- **Register Number:** ${data.registerNumber || 'N/A'}\n` +
          `- **Role:** ${data.role}\n` +
          `- **Contact:** ${data.phone || 'Not provided'}\n` +
          `- **Location:** ${data.city ? `${data.city}, ${data.state || ''}` : 'Not provided'}`
        );
      }

      case 'student.getDashboard': {
        return (
          `### 🎓 Student Academic Dashboard\n\n` +
          `- **Student:** ${data.student?.displayName || context.displayName || 'Student'} (${data.student?.registerNumber || context.registerNumber || 'N/A'})\n` +
          `- **Class:** ${data.class?.name || 'Class Assigned'}\n` +
          `- **Program:** ${data.program?.name || 'Academic Program'}\n` +
          `- **Department:** ${data.department?.name || 'Department'}\n` +
          `- **Class Incharge:** ${data.classIncharge?.name || 'Assigned Faculty'}\n` +
          `- **Academic Year:** ${data.academicYear?.name || 'Current Year'} (Semester ${data.semester?.termNumber || data.class?.currentSemester || 1})\n` +
          `- **Enrolled Subjects:** ${Array.isArray(data.subjects) ? data.subjects.length : 0} courses`
        );
      }

      case 'student.getClassIncharge': {
        let res = `### 👨‍🏫 **${data.name}**\n\n`;
        if (data.photoUrl) {
          res += `![${data.name} Photo](${data.photoUrl})\n\n`;
        }
        res += `- **Role:** **Assigned Class Incharge / Academic Mentor**\n`;
        res += `- **Designation:** ${data.designation || 'Assistant Professor'}\n`;
        res += `- **Department:** ${data.department || 'Department Faculty'}\n`;
        res += `- **Contact Email:** [${data.email}](mailto:${data.email})\n`;
        res += `- **Phone:** ${data.phone ? data.phone : '*Not listed in the portal*'}\n\n`;
        res += `> **Official Database Record:** Verified Class Incharge assigned to your registered class section.`;
        return res;
      }

      case 'student.getSubjects': {
        if (!Array.isArray(data) || data.length === 0) {
          return `### 📚 Enrolled Subjects\n\nNo subjects are currently listed for your department.`;
        }
        let res = `### 📚 Prescribed Subjects (${data.length} Courses)\n\n`;
        data.forEach((sub: any) => {
          res += `• **${sub.code} — ${sub.name}** (${sub.credits} Credits, Sem ${sub.semesterNumber})\n`;
        });
        return res;
      }

      case 'student.getClass': {
        return (
          `### 🏫 Class Information\n\n` +
          `- **Class Name:** ${data.name}\n` +
          `- **Current Semester:** Semester ${data.currentSemester}\n` +
          `- **Batch:** ${data.batch?.name || 'Active Batch'}\n` +
          `- **Program:** ${data.program?.name || 'Degree Program'}\n` +
          `- **Class Incharge:** ${data.classIncharge?.name || 'Assigned Faculty'}`
        );
      }

      case 'student.getBatch': {
        return (
          `### 🎓 Batch Details\n\n` +
          `- **Batch:** ${data.name || `${data.startYear} - ${data.endYear}`}\n` +
          `- **Start Year:** ${data.startYear}\n` +
          `- **Graduation Year:** ${data.endYear}\n` +
          `- **Status:** ${data.isActive ? 'Active' : 'Inactive'}`
        );
      }

      case 'student.getProgram': {
        return (
          `### 📖 Academic Program\n\n` +
          `- **Program:** ${data.name}\n` +
          `- **Degree Type:** ${data.type}\n` +
          `- **Duration:** ${data.durationYears} Years`
        );
      }

      case 'student.getDepartment': {
        const hod = data.hod;
        let res = `### 🏛️ **${data.name} (${data.code})**\n\n`;
        if (hod?.displayName) {
          res += `### 👨‍💼 Head of Department (HOD): **${hod.displayName}**\n\n`;
          if (hod.photoURL) {
            res += `![${hod.displayName} Photo](${hod.photoURL})\n\n`;
          }
          res += `- **HOD Name:** **${hod.displayName}**\n`;
          res += `- **Role:** Head of the Department (HOD)\n`;
          if (hod.email) res += `- **Email:** [${hod.email}](mailto:${hod.email})\n`;
        } else {
          res += `- **Head of Department (HOD):** *Not currently assigned in the portal database*\n`;
        }
        res += `- **Department Name:** ${data.name}\n`;
        res += `- **Department Code:** ${data.code}\n`;
        if (data.collegeName) res += `- **Affiliated College:** ${data.collegeName}\n\n`;
        res += `> **Official Database Record:** Retrieved directly from official department records in PostgreSQL.`;
        return res;
      }

      case 'student.getAcademicYears': {
        let res = `### 🗓️ Academic Years\n\n`;
        data.forEach((ay: any) => {
          res += `• **${ay.name}** ${ay.isCurrent ? '*(Current Active)*' : ''}: ${ay.startDate} to ${ay.endDate}\n`;
        });
        return res;
      }

      case 'student.getSemesters': {
        let res = `### 🗓️ Semesters\n\n`;
        data.forEach((s: any) => {
          res += `• **Term ${s.termNumber}:** ${s.startDate} to ${s.endDate}\n`;
        });
        return res;
      }

      case 'student.searchKnowledge': {
        if (!data.results || data.results.length === 0) {
          return (
            `### 📖 Academic Regulations & Knowledge Vault\n\n` +
            `No official regulations or institutional policies matching **"${data.query}"** were found in your college's knowledge base.\n\n` +
            `Your College Admin can upload official policies, dress codes, exam rules, and student guidelines via the **RAG Vault** in the Admin Portal.`
          );
        }
        let res = `### 📖 Academic Regulations & Policy Answers\n\n`;
        data.results.forEach((r: any) => {
          res += `#### 📜 ${r.title}\n\n`;
          if (r.content && r.content.length > r.snippet.length) {
            res += `${r.content}\n\n`;
          } else {
            res += `> ${r.snippet}\n\n`;
          }
          if (r.source) res += `*Source: ${r.source}*\n\n`;
        });
        return res;
      }

      case 'student.getKnowledgeContext': {
        return (
          `### 📖 ${data.title}\n\n` +
          `**Category:** ${data.category}\n\n` +
          `${data.content || data.snippet || 'No text content available.'}`
        );
      }

      default:
        return `### Result from ${executed.toolName}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    }
  }

  /**
   * Main chat entry point: processes chat messages, executes chosen tool,
   * synthesizes response, and returns structured contract.
   */
  public async processChat(
    request: StudentChatRequest,
    context: StudentContext,
  ): Promise<StudentChatResponseData> {
    const startTime = Date.now();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Sanitize & Guardrail Input
    const { sanitized, isSuspicious } = this.sanitizeAndValidateInput(request.message);

    const toolsExecuted: ToolExecutionResult[] = [];

    // 2. Determine and execute tools unless suspicious or disabled
    if (!isSuspicious && request.toolChoice !== 'none') {
      let targetTool: StudentToolName | null = null;
      let toolArgs: Record<string, any> = {};

      if (request.toolChoice && request.toolChoice !== 'auto') {
        targetTool = request.toolChoice;
        toolArgs = request.directToolArgs || {};
      } else {
        const detected = this.detectToolIntent(sanitized);
        targetTool = detected.toolName;
        toolArgs = detected.args;
      }

      if (targetTool) {
        const execResult = await studentToolRegistry.executeTool(targetTool, toolArgs, context);
        toolsExecuted.push(execResult);
      }
    }

    // 3. Synthesize Grounded Response
    const { reply, provider } = await this.synthesizeResponse(sanitized, toolsExecuted, context, isSuspicious);

    const durationMs = Date.now() - startTime;

    return {
      reply,
      messageId,
      toolsExecuted,
      confidence: isSuspicious ? 0.0 : toolsExecuted.length > 0 ? 0.95 : 0.85,
      processingTimeMs: durationMs,
      provider,
    };
  }
}

export const studentAiOrchestratorService = new StudentAiOrchestratorService();
