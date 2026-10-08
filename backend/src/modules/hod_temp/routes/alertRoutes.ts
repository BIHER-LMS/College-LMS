import { Router } from 'express';
import { alertController } from '../controllers/alertController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const createAlertSchema = {
  body: z.object({
    studentId: z.string().min(1),
    attendancePercentage: z.number().min(0).max(100),
    gpa: z.number().min(0).max(10),
    alertType: z.string().min(2),
    notes: z.string().optional(),
  }),
};

router.use(requireAuth);

router.get('/', (req, res, next) => alertController.getAlerts(req, res, next));
router.post('/', validate(createAlertSchema), (req, res, next) =>
  alertController.createAlert(req, res, next)
);
router.put('/:id', (req, res, next) => alertController.updateAlert(req, res, next));

export default router;
