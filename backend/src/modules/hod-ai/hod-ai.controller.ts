<<<<<<< Updated upstream
/**
 * HOD AI Orchestrator — Controller
 *
 * Thin controller layer that:
 * 1. Extracts and validates the HOD context from the request
 * 2. Validates the request body via Zod
 * 3. Delegates to the orchestrator
 * 4. Returns structured responses using the existing sendSuccess/AppError patterns
 *
 * IMPORTANT: This controller does NOT perform authentication or authorization.
 * That is handled by the middleware stack:
 *   authenticateFirebaseUser → requireAuth → requireHOD
 *
 * @module hod-ai/controller
 * @owner Abhinav
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../hod_temp/middleware/authMiddleware';
import { hodAIOrchestrator } from './hod-ai.orchestrator';
import { hodAIChatRequestSchema } from './hod-ai.validation';
import { HODAIErrorCodes } from './hod-ai.types';
import type { HODAIContext } from './hod-ai.types';
import { AppError } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import { logger } from '../../utils/logger';

/**
 * Build the HODAIContext from the authenticated request.
 *
 * This is analogous to buildStudentContext in the student module:
 * it takes the already-authenticated and role-verified request
 * and extracts the trusted context for the AI orchestrator.
 *
 * The HOD context is built by requireAuth + requireHOD middleware
 * and is available on req.hod.
 */
function buildAIContext(req: AuthenticatedRequest): HODAIContext {
  const hod = req.hod;

  if (!hod) {
    throw new AppError(
      403,
      HODAIErrorCodes.UNAUTHORIZED_ROLE,
      'HOD context is not available. Ensure authentication and HOD middleware are applied.',
    );
  }

  if (!hod.departmentId) {
    throw new AppError(
      403,
      HODAIErrorCodes.UNAUTHORIZED_ROLE,
      'No department is assigned to this HOD account.',
    );
  }

  if (!hod.collegeId) {
    throw new AppError(
      403,
      HODAIErrorCodes.UNAUTHORIZED_ROLE,
      'No college is assigned to this HOD account.',
    );
  }

  return {
    uid: hod.uid,
    email: hod.email,
    displayName: hod.displayName,
    photoUrl: hod.photoUrl,
    role: hod.role,
    departmentId: hod.departmentId,
    collegeId: hod.collegeId,
  };
}

// ─── Controller ──────────────────────────────────────────────────────

class HODAIController {
  /**
   * POST /api/hod/ai/chat
   *
   * Main chat endpoint for the HOD AI assistant.
   *
   * Request body:
   *   { message: string, conversationHistory?: ChatMessage[], conversationId?: string }
   *
   * Response:
   *   { success: true, data: HODAIChatResponse }
   */
  async chat(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // 1. Build trusted HOD context
      const context = buildAIContext(req);

      // 2. Validate request body
      const parseResult = hodAIChatRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const details = parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw new AppError(
          400,
          HODAIErrorCodes.INVALID_REQUEST,
          'Invalid chat request',
          details,
        );
      }

      // 3. Delegate to orchestrator
      const response = await hodAIOrchestrator.chat(context, parseResult.data);

      // 4. Return structured response
=======
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../hod_temp/middleware/authMiddleware';
import { AIRequestSchema } from './hod-ai.types';
import { hodAiService } from './hod-ai.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class HODAiController {
  async handleQuery(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.hod) {
        throw new UnauthorizedError('HOD context missing');
      }

      const validatedBody = AIRequestSchema.parse(req.body);
      
      const response = await hodAiService.processQuery(validatedBody, req.hod);

>>>>>>> Stashed changes
      sendSuccess(res, response, 200);
    } catch (error) {
      next(error);
    }
  }
<<<<<<< Updated upstream

  /**
   * GET /api/hod/ai/tools
   *
   * Introspection endpoint: returns the list of available tools.
   * Useful for the frontend to display AI capabilities.
   *
   * Response:
   *   { success: true, data: { tools: [...] } }
   */
  async getTools(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Build context to verify authorization
      buildAIContext(req);

      const tools = hodAIOrchestrator.getAvailableTools();
      sendSuccess(res, { tools }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/hod/ai/health
   *
   * Health check for the AI orchestrator subsystem.
   *
   * Response:
   *   { success: true, data: { status: 'healthy', ... } }
   */
  async health(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      sendSuccess(res, {
        status: 'healthy',
        toolCount: hodAIOrchestrator.getAvailableTools().length,
        timestamp: new Date().toISOString(),
      }, 200);
    } catch (error) {
      next(error);
    }
  }
}

// ─── Singleton export ────────────────────────────────────────────────

/**
 * Import path:
 *   import { hodAIController } from '../modules/hod-ai/hod-ai.controller';
 */
export const hodAIController = new HODAIController();
=======
}

export const hodAiController = new HODAiController();
>>>>>>> Stashed changes
