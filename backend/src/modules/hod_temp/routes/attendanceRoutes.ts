import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => attendanceController.getAttendance(req, res, next));
router.get('/summary', (req, res, next) => attendanceController.getAttendanceSummary(req, res, next));

export default router;
