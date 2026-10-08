import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (err) {
      return next(err);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.uid);
      return sendSuccess(res, user, 'Current user profile');
    } catch (err) {
      return next(err);
    }
  }
}

export const authController = new AuthController();
