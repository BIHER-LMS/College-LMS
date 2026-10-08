import { Router } from 'express';
import { announcementController } from '../controllers/announcementController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const createAnnouncementSchema = {
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    message: z.string().min(2, 'Message is required'),
    scope: z.string().default('Entire Department (Faculty + Students)'),
    classification: z.string().default('Standard Administrative Notice'),
  }),
};

router.use(requireAuth);

router.get('/', (req, res, next) => announcementController.getAnnouncements(req, res, next));
router.post('/', validate(createAnnouncementSchema), (req, res, next) =>
  announcementController.createAnnouncement(req, res, next)
);
router.put('/:id', (req, res, next) => announcementController.updateAnnouncement(req, res, next));
router.delete('/:id', (req, res, next) => announcementController.deleteAnnouncement(req, res, next));

export default router;
