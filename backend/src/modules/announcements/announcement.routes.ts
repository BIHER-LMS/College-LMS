import { Router } from 'express';
import { announcementController } from './announcement.controller';
import { authenticateFirebaseUser } from '../../middleware/auth.middleware';

const router = Router();

// GET announcements: public or authenticated with optional role/collegeId
router.get('/', (req, res, next) => announcementController.getAnnouncements(req, res, next));

// POST, PUT, DELETE: require authenticated user
router.post('/', authenticateFirebaseUser, (req, res, next) =>
  announcementController.createAnnouncement(req, res, next)
);

router.put('/:id', authenticateFirebaseUser, (req, res, next) =>
  announcementController.updateAnnouncement(req, res, next)
);

router.delete('/:id', authenticateFirebaseUser, (req, res, next) =>
  announcementController.deleteAnnouncement(req, res, next)
);

export default router;
