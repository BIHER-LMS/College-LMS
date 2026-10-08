import { Router } from 'express';
import { subjectController } from '../controllers/subjectController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const createSubjectSchema = {
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(1),
    credits: z.number().int().min(1),
    semesterId: z.string().min(1),
    departmentId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

router.use(requireAuth);

router.get('/', (req, res, next) => subjectController.getSubjects(req, res, next));
router.get('/:id', (req, res, next) => subjectController.getSubjectById(req, res, next));
router.post('/', validate(createSubjectSchema), (req, res, next) =>
  subjectController.createSubject(req, res, next)
);
router.put('/:id', (req, res, next) => subjectController.updateSubject(req, res, next));
router.delete('/:id', (req, res, next) => subjectController.deleteSubject(req, res, next));

export default router;
