import { Router, Response, NextFunction } from 'express';
import { leaveController } from './leave.controller';
import { authenticateFirebaseUser, AuthenticatedRequest } from '../../middleware/auth.middleware';

const router = Router();

const tryAuthenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      await authenticateFirebaseUser(req, res, () => {});
    } catch {
      // Continue
    }
  }
  next();
};

// 1. Student applies for leave
router.post('/', tryAuthenticateUser, (req, res, next) =>
  leaveController.applyLeave(req as AuthenticatedRequest, res, next)
);

// 2. Student views their own leaves
router.get('/my', tryAuthenticateUser, (req, res, next) =>
  leaveController.getMyLeaves(req as AuthenticatedRequest, res, next)
);

// 3. Faculty / Class Incharge views leaves for a class
router.get('/class/:classId', tryAuthenticateUser, (req, res, next) =>
  leaveController.getClassLeaves(req as AuthenticatedRequest, res, next)
);

// 4. Class Incharge reviews (Approve / Reject) a leave
router.patch('/:id/review', tryAuthenticateUser, (req, res, next) =>
  leaveController.reviewLeave(req as AuthenticatedRequest, res, next)
);

export default router;
