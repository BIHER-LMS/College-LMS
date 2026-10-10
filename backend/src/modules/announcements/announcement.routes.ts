import { Router, Response, NextFunction } from 'express';
import { announcementController } from './announcement.controller';
import { authenticateFirebaseUser, AuthenticatedRequest } from '../../middleware/auth.middleware';

const router = Router();

// Middleware to extract Firebase user if present without failing the request
const tryAuthenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      await authenticateFirebaseUser(req, res, () => {});
    } catch {
      // Continue even if token is in dev/mock state
    }
  }
  next();
};

// GET announcements: public or authenticated with role/collegeId filters
router.get('/', tryAuthenticateUser, (req, res, next) =>
  announcementController.getAnnouncements(req, res, next)
);

// POST, PUT, DELETE: live PostgreSQL operations
router.post('/', tryAuthenticateUser, (req, res, next) =>
  announcementController.createAnnouncement(req as AuthenticatedRequest, res, next)
);

router.put('/:id', tryAuthenticateUser, (req, res, next) =>
  announcementController.updateAnnouncement(req as AuthenticatedRequest, res, next)
);

router.delete('/:id', tryAuthenticateUser, (req, res, next) =>
  announcementController.deleteAnnouncement(req as AuthenticatedRequest, res, next)
);

export default router;
