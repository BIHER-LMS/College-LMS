import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, ErrorCodes } from '../../../utils/response';
import { facultyAiOrchestratorService } from './facultyAi.service';
import { facultyToolRegistry } from './toolRegistry';
import { toFacultyContext } from './facultyAi.types';
import type { AuthenticatedUserContext } from '../faculty.types';

export class FacultyAiController {
  /**
   * Main Chat Endpoint
   * POST /api/faculty/chat & POST /api/faculty/ai/chat
   */
  public chat = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user: AuthenticatedUserContext | undefined =
        req.facultyUser || (req as any).user;

      if (!user || !user.uid) {
        sendError(
          res,
          401,
          ErrorCodes.UNAUTHORIZED,
          'Unauthorized: Faculty authentication context required',
        );
        return;
      }

      const context = toFacultyContext(user);
      const result = await facultyAiOrchestratorService.processChat(
        req.body,
        context,
      );

      sendSuccess(res, result, 200);
    } catch (error: any) {
      if (error && typeof error.status === 'number' && error.message) {
        sendError(
          res,
          error.status,
          ErrorCodes.VALIDATION_ERROR,
          error.message,
        );
        return;
      }
      next(error);
    }
  };

  /**
   * List Canonical Registered Tools
   * GET /api/faculty/ai/tools
   */
  public listTools = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user: AuthenticatedUserContext | undefined =
        req.facultyUser || (req as any).user;

      if (!user || !user.uid) {
        sendError(
          res,
          401,
          ErrorCodes.UNAUTHORIZED,
          'Unauthorized: Faculty authentication context required',
        );
        return;
      }

      const tools = facultyToolRegistry.listTools();
      sendSuccess(res, tools, 200);
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Controlled Direct Tool Execution
   * POST /api/faculty/ai/tools/execute
   */
  public executeTool = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user: AuthenticatedUserContext | undefined =
        req.facultyUser || (req as any).user;

      if (!user || !user.uid) {
        sendError(
          res,
          401,
          ErrorCodes.UNAUTHORIZED,
          'Unauthorized: Faculty authentication context required',
        );
        return;
      }

      const context = toFacultyContext(user);
      const { toolName, arguments: args } = req.body;

      const result = await facultyToolRegistry.executeTool(
        toolName,
        args || {},
        context,
      );

      sendSuccess(res, result, 200);
    } catch (error: any) {
      next(error);
    }
  };
}

export const facultyAiController = new FacultyAiController();
