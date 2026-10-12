import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../../utils/response';
import { AppError } from '../../../utils/errors';
import { studentAiOrchestratorService } from './studentAi.service';
import { studentToolRegistry } from './toolRegistry';
import { StudentChatRequest, DirectToolExecutionRequest } from './studentAi.types';

export class StudentAiController {
  /**
   * POST /api/student/ai/chat (also aliased at /api/student/chat)
   * Main student chat endpoint
   */
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentContext = (req as any).studentContext;
      if (!studentContext) {
        throw new AppError(401, 'UNAUTHORIZED', 'Student context is missing from request.');
      }

      const body = req.body as StudentChatRequest;
      const result = await studentAiOrchestratorService.processChat(body, studentContext);

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/student/ai/tools
   * Lists the 14 canonical student tools and parameter schemas
   */
  async listTools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tools = studentToolRegistry.listTools();
      sendSuccess(res, { tools }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/student/ai/tools/execute
   * Direct controlled execution of a single canonical student tool
   */
  async executeTool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentContext = (req as any).studentContext;
      if (!studentContext) {
        throw new AppError(401, 'UNAUTHORIZED', 'Student context is missing from request.');
      }

      const { toolName, args } = req.body as DirectToolExecutionRequest;
      const result = await studentToolRegistry.executeTool(toolName, args || {}, studentContext);

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const studentAiController = new StudentAiController();
