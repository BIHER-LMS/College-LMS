import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const querySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    classId: z.string().optional(),
  }),
};

const createStudentSchema = {
  body: z.object({
    registerNumber: z.string().min(1),
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
    classId: z.string().min(1),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

router.use(requireAuth);

router.get('/', validate(querySchema), (req, res, next) =>
  studentController.getStudents(req, res, next)
);
router.get('/:id', (req, res, next) => studentController.getStudentById(req, res, next));
router.post('/', validate(createStudentSchema), (req, res, next) =>
  studentController.createStudent(req, res, next)
);
router.put('/:id', (req, res, next) => studentController.updateStudent(req, res, next));
router.delete('/:id', (req, res, next) => studentController.deleteStudent(req, res, next));

export default router;
