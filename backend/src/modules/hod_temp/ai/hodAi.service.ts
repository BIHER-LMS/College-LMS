import type { HODContext } from '../middleware/authMiddleware';
import { BadRequestError } from '../utils/errors';
import {
  ChatMessage,
  HodChatRequest,
  HodChatResponseData,
  HodToolName,
  ToolExecutionResult,
} from './hodAi.types';
import { hodToolRegistry } from './toolRegistry';

/**
 * Common prompt injection and boundary-escape patterns.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?(admin|superadmin|root|developer)/i,
  /bypass\s+(departmental|department|college|tenant)\s+(isolation|restriction|rule|boundary)/i,
  /reveal\s+(system\s+prompt|database\s+password|api\s+key|credentials)/i,
  /disregard\s+(the\s+)?(rules|policies|guardrails)/i,
  /<script[\s>]/i,
  /drop\s+table/i,
  /select\s+\*\s+from/i,
];

export class HodAiOrchestratorService {
  /**
   * Sanitizes user inputs and verifies that prompt injection attempts
   * do not compromise system security or tenant boundaries.
   */
  public sanitizeAndValidateInput(message: string): {
    sanitized: string;
    isSuspicious: boolean;
  } {
    const trimmed = message.trim();

    if (!trimmed) {
      throw new BadRequestError('Message cannot be empty');
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
    toolName: HodToolName | null;
    args: Record<string, any>;
  } {
    const lower = message.toLowerCase();

    // 1. Student Attendance Intent
    if (
      lower.includes('student') &&
      (lower.includes('attendance') || lower.includes('percentage') || lower.includes('record'))
    ) {
      // Look for possible student ID pattern like stud-123 or REG-123
      const idMatch = message.match(/(?:student(?:Id)?|id|reg(?:ister)?(?:\s+no)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const studentId = idMatch ? idMatch[1] : 'stud-default-01';

      return {
        toolName: 'hod.getStudentAttendance',
        args: { studentId },
      };
    }

    // 2. Class Attendance Intent
    if (
      lower.includes('class') &&
      (lower.includes('attendance') || lower.includes('at risk') || lower.includes('absent'))
    ) {
      const classMatch = message.match(/(?:class(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      const classId = classMatch ? classMatch[1] : 'class-cse-3a';

      return {
        toolName: 'hod.getClassAttendance',
        args: { classId },
      };
    }

    // 3. Analytics / Trends Intent
    if (
      lower.includes('trend') ||
      lower.includes('analytics') ||
      lower.includes('defaulter') ||
      lower.includes('distribution')
    ) {
      let metric: 'trends' | 'defaulters' | 'subject_breakdown' | 'distribution' = 'trends';
      if (lower.includes('defaulter')) metric = 'defaulters';
      if (lower.includes('subject')) metric = 'subject_breakdown';
      if (lower.includes('distribution')) metric = 'distribution';

      return {
        toolName: 'hod.getAttendanceAnalytics',
        args: {
          timeframe: lower.includes('week') ? 'week' : lower.includes('month') ? 'month' : 'semester',
          metric,
        },
      };
    }

    // 4. Department-Wide Attendance Intent
    if (
      lower.includes('department attendance') ||
      lower.includes('all classes') ||
      lower.includes('across department')
    ) {
      return {
        toolName: 'hod.getDepartmentAttendance',
        args: {
          filterBy: lower.includes('risk') ? 'at_risk' : 'all',
        },
      };
    }

    // 5. Attendance Summary Intent (general/cohorts)
    if (
      lower.includes('attendance') ||
      lower.includes('summary') ||
      lower.includes('cohort') ||
      lower.includes('average')
    ) {
      return {
        toolName: 'hod.getAttendanceSummary',
        args: {},
      };
    }

    // 6. Knowledge / Document Context Intent
    if (
      lower.includes('document') ||
      lower.includes('section') ||
      lower.includes('doc-')
    ) {
      const docMatch = message.match(/(?:doc(?:ument)?(?:Id)?)\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
      return {
        toolName: 'hod.getKnowledgeContext',
        args: {
          documentId: docMatch ? docMatch[1] : 'doc-policy-01',
        },
      };
    }

    // 7. Policy / Regulations / Search Intent
    if (
      lower.includes('policy') ||
      lower.includes('regulation') ||
      lower.includes('rule') ||
      lower.includes('guideline') ||
      lower.includes('condonation') ||
      lower.includes('handbook') ||
      lower.includes('search')
    ) {
      return {
        toolName: 'hod.searchKnowledge',
        args: {
          query: message.slice(0, 100),
          category: lower.includes('handbook') ? 'handbook' : 'policy',
        },
      };
    }

    return { toolName: null, args: {} };
  }

  /**
   * Synthesize a response based on executed tools and context.
   */
  public synthesizeResponse(
    userMessage: string,
    toolsExecuted: ToolExecutionResult[],
    context: HODContext,
    isSuspicious: boolean,
  ): string {
    if (isSuspicious) {
      return (
        `Security Notice: Your query contained instructions attempting to alter system guardrails or departmental boundaries. ` +
        `This session is strictly locked to Department: ${context.departmentId} at College: ${context.collegeId}. ` +
        `All operations remain constrained to approved departmental queries.`
      );
    }

    if (toolsExecuted.length === 0) {
      return (
        `Hello ${context.displayName || 'HOD'}. I am your departmental AI Assistant for Department ${context.departmentId}. ` +
        `I can help you review attendance summaries, analyze at-risk cohorts, monitor individual student attendance, ` +
        `and query institutional regulations and academic policies. How can I assist you today?`
      );
    }

    const executed = toolsExecuted[0];
    if (executed.status === 'error') {
      return (
        `I attempted to execute ${executed.toolName}, but encountered an error: ` +
        `${executed.error?.message || 'Execution failed'}. Please check the parameters or try again.`
      );
    }

    // Format tool-specific synthesized response
    switch (executed.toolName) {
      case 'hod.getAttendanceSummary': {
        const data = executed.result;
        return (
          `### Departmental Attendance Summary\n\n` +
          `- **Department Average:** ${data.departmentAverage}%\n` +
          `- **Total Students:** ${data.totalStudents}\n` +
          `- **Total Classes:** ${data.totalClasses}\n\n` +
          `**Cohort Breakdown:**\n` +
          data.cohorts
            .map(
              (c: any) =>
                `• **${c.cohortName}**: ${c.percentage}% (${c.studentCount} students)${c.isAlert ? ' ⚠️ *Below Target Alert*' : ''}`,
            )
            .join('\n')
        );
      }

      case 'hod.getStudentAttendance': {
        const data = executed.result;
        return (
          `### Student Attendance: ${data.studentName} (${data.registerNumber})\n\n` +
          `- **Class:** ${data.className}\n` +
          `- **Overall Attendance:** ${data.overallPercentage}% ${data.isLowAttendance ? '⚠️ *(Critical - Below 75%)*' : '✅'}\n` +
          `- **Sessions Attended:** ${data.attendedSessions} / ${data.totalSessions}\n\n` +
          `**Subject Breakdown:**\n` +
          data.subjects
            .map(
              (s: any) =>
                `• **${s.subjectCode} - ${s.subjectName}**: ${s.percentage}% (${s.attended}/${s.total})`,
            )
            .join('\n')
        );
      }

      case 'hod.getClassAttendance': {
        const data = executed.result;
        return (
          `### Class Attendance: ${data.className} (Section ${data.section})\n\n` +
          `- **Batch:** ${data.batch}\n` +
          `- **Class In-charge:** ${data.classInchargeName || 'Not assigned'}\n` +
          `- **Class Average:** ${data.averagePercentage}%\n` +
          `- **Total Students:** ${data.totalStudents} (${data.presentTodayCount ?? 'N/A'} present today)\n` +
          `- **At-Risk Students (<75%):** ${data.atRiskStudentsCount}\n\n` +
          (data.atRiskStudents.length > 0
            ? `**At-Risk Student List:**\n` +
              data.atRiskStudents
                .map((s: any) => `• ${s.studentName} (${s.registerNumber}): ${s.percentage}%`)
                .join('\n')
            : `All students meet the attendance threshold.`)
        );
      }

      case 'hod.getDepartmentAttendance': {
        const data = executed.result;
        return (
          `### Department-Wide Attendance: ${data.departmentName}\n\n` +
          `- **Overall Department Average:** ${data.overallPercentage}%\n` +
          `- **Total Classes:** ${data.totalClasses} | **Total Students:** ${data.totalStudents}\n` +
          `- **Total Students at Risk:** ${data.atRiskCount}\n\n` +
          `**Class Summary:**\n` +
          data.classes
            .map(
              (cls: any) =>
                `• **${cls.className}**: ${cls.averagePercentage}% (${cls.studentCount} students, ${cls.atRiskCount} at-risk)`,
            )
            .join('\n')
        );
      }

      case 'hod.getAttendanceAnalytics': {
        const data = executed.result;
        return (
          `### Departmental Attendance Analytics (${data.timeframe})\n\n` +
          `**Trends Over Time:**\n` +
          data.trends
            .map((t: any) => `• **${t.period}**: ${t.percentage}% across ${t.sessionsHeld} sessions`)
            .join('\n') +
          `\n\n**Defaulter Distribution:**\n` +
          `• Below 65% (Severe): ${data.defaulterBuckets.below65} students\n` +
          `• 65% - 75% (Warning): ${data.defaulterBuckets.between65And75} students\n` +
          `• 75%+ (Good): ${data.defaulterBuckets.above75} students\n\n` +
          `**Key Insights:**\n` +
          data.insights.map((insight: string) => `• ${insight}`).join('\n')
        );
      }

      case 'hod.searchKnowledge': {
        const data = executed.result;
        return (
          `### Institutional Knowledge Search: "${data.query}"\n\n` +
          `Found ${data.resultsCount} relevant reference(s):\n\n` +
          data.results
            .map(
              (r: any) =>
                `• **${r.title}** [${r.category.toUpperCase()}] (Score: ${(r.score * 100).toFixed(0)}%)\n  *"${r.snippet}"*`,
            )
            .join('\n\n')
        );
      }

      case 'hod.getKnowledgeContext': {
        const data = executed.result;
        return (
          `### Document Reference: ${data.title}\n` +
          `**Section:** ${data.section || 'General'}\n\n` +
          `${data.content}\n\n` +
          `*(Last Updated: ${new Date(data.lastUpdated).toLocaleDateString()})*`
        );
      }

      default:
        return `Successfully processed your request using tool ${executed.toolName}.`;
    }
  }

  /**
   * Main orchestrator flow:
   * 1. Sanitize & check injection
   * 2. Resolve tool choice
   * 3. Execute approved tools via canonical registry
   * 4. Synthesize final response
   */
  public async processChat(
    request: HodChatRequest,
    context: HODContext,
  ): Promise<HodChatResponseData> {
    const { sanitized, isSuspicious } = this.sanitizeAndValidateInput(
      request.message,
    );

    const toolsExecuted: ToolExecutionResult[] = [];

    // If injection was detected, do not invoke tools with untrusted instructions
    if (!isSuspicious) {
      if (request.toolChoice === 'none') {
        // Skip tool execution explicitly
      } else if (
        request.toolChoice &&
        typeof request.toolChoice === 'object' &&
        request.toolChoice.type === 'tool'
      ) {
        // Explicit tool requested
        const toolResult = await hodToolRegistry.executeTool(
          request.toolChoice.name,
          {},
          context,
        );
        toolsExecuted.push(toolResult);
      } else {
        // Auto tool detection
        const { toolName, args } = this.detectToolIntent(sanitized);
        if (toolName) {
          const toolResult = await hodToolRegistry.executeTool(
            toolName,
            args,
            context,
          );
          toolsExecuted.push(toolResult);
        }
      }
    }

    const synthesizedMessage = this.synthesizeResponse(
      sanitized,
      toolsExecuted,
      context,
      isSuspicious,
    );

    return {
      message: synthesizedMessage,
      toolsExecuted,
      metadata: {
        departmentId: context.departmentId,
        collegeId: context.collegeId || '',
        timestamp: new Date().toISOString(),
        model: 'hod-ai-orchestrator-v1',
      },
    };
  }
}

export const hodAiOrchestratorService = new HodAiOrchestratorService();
