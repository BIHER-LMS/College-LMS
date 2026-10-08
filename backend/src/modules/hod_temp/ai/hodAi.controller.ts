import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ForbiddenError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { hodAiOrchestratorService } from './hodAi.service';
import { hodToolRegistry } from './toolRegistry';

export class HodAiController {
  /**
   * Main Chat Endpoint
   * POST /api/hod/ai/chat
   */
  public async chat(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.hod) {
        throw new ForbiddenError('HOD authorization context is required');
      }

      const result = await hodAiOrchestratorService.processChat(
        req.body,
        req.hod,
      );

      sendSuccess(res, result, 200, 'Chat response generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List Canonical Registered Tools
   * GET /api/hod/ai/tools
   */
  public async listTools(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.hod) {
        throw new ForbiddenError('HOD authorization context is required');
      }

      const tools = hodToolRegistry.getRegisteredTools();
      sendSuccess(res, tools, 200, 'Canonical HOD tools retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controlled Direct Tool Execution
   * POST /api/hod/ai/tools/execute
   */
  public async executeTool(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.hod) {
        throw new ForbiddenError('HOD authorization context is required');
      }

      const { toolName, arguments: args } = req.body;
      const result = await hodToolRegistry.executeTool(
        toolName,
        args || {},
        req.hod,
      );

      sendSuccess(res, result, 200, 'Tool executed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const hodAiController = new HodAiController();
