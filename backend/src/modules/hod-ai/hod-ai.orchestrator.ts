/**
 * HOD AI Orchestrator — Core Service
 *
 * This is the AI orchestration layer that:
 * 1. Receives validated chat requests
 * 2. Builds context for the LLM
 * 3. Determines which tools the LLM wants to invoke
 * 4. Executes approved tools via the tool registry
 * 5. Formats the response
 *
 * The LLM integration is intentionally abstracted — currently using
 * a deterministic intent parser. When a real LLM provider is added,
 * only the `resolveToolCalls` method needs to change.
 *
 * CRITICAL: The LLM never becomes the authorization layer.
 * Authorization is enforced by:
 *   1. Firebase auth middleware (identity)
 *   2. requireHOD middleware (role + department)
 *   3. Tool registry authorization checks (per-tool)
 *   4. Tool executor scoping (data access)
 *
 * @module hod-ai/orchestrator
 * @owner Abhinav
 */

import { randomUUID } from 'node:crypto';
import type {
  HODAIContext,
  HODAIChatRequest,
  HODAIChatResponse,
  ToolInvocationRecord,
} from './hod-ai.types';
import { HODAIErrorCodes } from './hod-ai.types';
import { toolRegistry } from './hod-ai.tool-registry';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

// ─── Intent Resolution ──────────────────────────────────────────────

/**
 * A resolved tool call from intent analysis.
 */
interface ResolvedToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

/**
 * Simple keyword-based intent resolver.
 *
 * This is the placeholder for a real LLM-based intent resolver.
 * It maps user messages to tool calls based on keyword patterns.
 *
 * When a real LLM is integrated (by a future developer), replace
 * this function body while preserving the signature.
 */
function resolveToolCalls(
  message: string,
  _context: HODAIContext,
): ResolvedToolCall[] {
  const lowerMessage = message.toLowerCase().trim();
  const toolCalls: ResolvedToolCall[] = [];

  // Attendance-related intents
  if (
    lowerMessage.includes('attendance summary') ||
    lowerMessage.includes('overall attendance') ||
    lowerMessage.includes('department attendance overview')
  ) {
    toolCalls.push({
      toolName: 'hod.getAttendanceSummary',
      args: {},
    });
  }

  if (
    lowerMessage.includes('student attendance') &&
    (lowerMessage.includes('specific') || lowerMessage.match(/student\s+\S+/))
  ) {
    // Try to extract a student UID-like reference
    // In real LLM integration, the LLM would extract this
    const uidMatch = lowerMessage.match(/student\s+([a-zA-Z0-9_-]+)/);
    if (uidMatch) {
      toolCalls.push({
        toolName: 'hod.getStudentAttendance',
        args: { studentUid: uidMatch[1] },
      });
    }
  }

  if (
    lowerMessage.includes('class attendance') &&
    !lowerMessage.includes('all classes')
  ) {
    // Try to extract a class ID
    const classIdMatch = lowerMessage.match(
      /class\s+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    );
    if (classIdMatch) {
      toolCalls.push({
        toolName: 'hod.getClassAttendance',
        args: { classId: classIdMatch[1] },
      });
    }
  }

  if (
    lowerMessage.includes('department attendance') ||
    lowerMessage.includes('department report') ||
    lowerMessage.includes('all classes attendance')
  ) {
    toolCalls.push({
      toolName: 'hod.getDepartmentAttendance',
      args: {},
    });
  }

  if (
    lowerMessage.includes('analytics') ||
    lowerMessage.includes('trend') ||
    lowerMessage.includes('at-risk') ||
    lowerMessage.includes('comparison')
  ) {
    let type: 'trend' | 'comparison' | 'risk' = 'trend';
    if (lowerMessage.includes('risk') || lowerMessage.includes('at-risk')) {
      type = 'risk';
    } else if (lowerMessage.includes('comparison') || lowerMessage.includes('compare')) {
      type = 'comparison';
    }
    toolCalls.push({
      toolName: 'hod.getAttendanceAnalytics',
      args: { type },
    });
  }

  // Knowledge-related intents
  if (
    lowerMessage.includes('search') ||
    lowerMessage.includes('find information') ||
    lowerMessage.includes('look up') ||
    lowerMessage.includes('knowledge')
  ) {
    // Extract a search query
    const queryMatch = lowerMessage.match(
      /(?:search|find|look up|knowledge)\s+(?:for\s+|about\s+)?(.+)/,
    );
    if (queryMatch) {
      toolCalls.push({
        toolName: 'hod.searchKnowledge',
        args: { query: queryMatch[1].trim() },
      });
    }
  }

  return toolCalls;
}

// ─── Response Formatting ─────────────────────────────────────────────

/**
 * Build a human-readable response from tool invocation results.
 *
 * When a real LLM is integrated, this function is replaced by
 * the LLM's response generation step.
 */
function formatResponse(
  message: string,
  toolResults: ToolInvocationRecord[],
  _context: HODAIContext,
): string {
  if (toolResults.length === 0) {
    return (
      'I understand your question, but I wasn\'t able to determine which specific ' +
      'data you need. You can ask me about:\n' +
      '• **Attendance summary** — overall department attendance\n' +
      '• **Student attendance** — attendance for a specific student\n' +
      '• **Class attendance** — attendance for a specific class\n' +
      '• **Department attendance report** — comprehensive department report\n' +
      '• **Analytics** — trends, comparisons, or at-risk students\n' +
      '• **Search knowledge base** — search for policies or academic information\n\n' +
      'Please try rephrasing your question with more specific details.'
    );
  }

  const parts: string[] = [];

  for (const result of toolResults) {
    if (result.success) {
      parts.push(
        `**${result.toolName}**: Successfully retrieved data. ` +
        `(${result.durationMs}ms)`,
      );
    } else {
      parts.push(
        `**${result.toolName}**: ${result.error || 'Failed to retrieve data.'}`,
      );
    }
  }

  // If all tools returned stub data, inform user
  const allStubs = toolResults.every(
    (r) => !r.success && r.error?.includes('not yet implemented'),
  );

  if (allStubs) {
    return (
      'I identified the right tools for your question, but the data retrieval ' +
      'modules are still being implemented. The following tools were matched:\n\n' +
      toolResults.map((r) => `• **${r.toolName}**`).join('\n') +
      '\n\nPlease check back once the attendance and knowledge modules are deployed.'
    );
  }

  return parts.join('\n\n');
}

// ─── Orchestrator Service ────────────────────────────────────────────

class HODAIOrchestrator {
  /**
   * Process a chat request through the full orchestration pipeline.
   *
   * Pipeline:
   *   1. Build conversation context
   *   2. Resolve intent → tool calls
   *   3. Execute tools via registry (with auth + validation)
   *   4. Format response
   *   5. Return structured response
   */
  async chat(
    context: HODAIContext,
    request: HODAIChatRequest,
  ): Promise<HODAIChatResponse> {
    const conversationId = request.conversationId || randomUUID();
    const startTime = Date.now();

    logger.info('[HOD-AI] Chat request received', {
      uid: context.uid,
      departmentId: context.departmentId,
      messageLength: request.message.length,
      conversationId,
    });

    try {
      // 1. Resolve tool calls from the user message
      const resolvedCalls = resolveToolCalls(request.message, context);

      logger.debug('[HOD-AI] Resolved tool calls', {
        count: resolvedCalls.length,
        tools: resolvedCalls.map((c) => c.toolName),
      });

      // 2. Execute each tool call
      const toolInvocations: ToolInvocationRecord[] = [];

      for (const call of resolvedCalls) {
        const toolStart = Date.now();
        const result = await toolRegistry.executeTool(
          call.toolName,
          context,
          call.args,
        );
        const toolDuration = Date.now() - toolStart;

        toolInvocations.push({
          toolName: call.toolName,
          input: call.args,
          success: result.success,
          error: result.error,
          durationMs: toolDuration,
        });
      }

      // 3. Format the response
      const responseMessage = formatResponse(
        request.message,
        toolInvocations,
        context,
      );

      const totalDuration = Date.now() - startTime;
      logger.info('[HOD-AI] Chat response generated', {
        conversationId,
        toolsInvoked: toolInvocations.length,
        totalDurationMs: totalDuration,
      });

      return {
        message: responseMessage,
        conversationId,
        toolsInvoked: toolInvocations,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const totalDuration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[HOD-AI] Orchestration error', {
        conversationId,
        error: message,
        durationMs: totalDuration,
      });

      // Never expose internal error details
      throw new AppError(
        500,
        HODAIErrorCodes.ORCHESTRATION_ERROR,
        'The AI assistant encountered an internal error. Please try again.',
      );
    }
  }

  /**
   * Get the list of available tools for introspection.
   * Useful for the frontend to display capabilities.
   */
  getAvailableTools() {
    return toolRegistry.getToolDefinitions().map((def) => ({
      name: def.name,
      purpose: def.purpose,
      authorization: def.authorization,
    }));
  }
}

// ─── Singleton export ────────────────────────────────────────────────

/**
 * The global HOD AI orchestrator singleton.
 *
 * Import path:
 *   import { hodAIOrchestrator } from '../modules/hod-ai/hod-ai.orchestrator';
 */
export const hodAIOrchestrator = new HODAIOrchestrator();
