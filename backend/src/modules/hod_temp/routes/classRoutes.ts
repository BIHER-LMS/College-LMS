import { Router } from 'express';
import { classController } from '../controllers/classController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const querySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    batchId: z.string().optional(),
  }),
};

const createClassSchema = {
  body: z.object({
    name: z.string().min(2, 'Class name is required'),
    batchId: z.string().min(1, 'Batch ID is required'),
    semesterId: z.string().min(1, 'Semester ID is required'),
    facultyId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

const inchargeSchema = {
  params: z.object({
    id: z.string().min(1, 'Class ID is required'),
  }),
  body: z.object({
    facultyUid: z.string().optional(),
    facultyId: z.string().optional(),
  }),
};

router.use(requireAuth);

router.get('/', validate(querySchema), (req, res, next) =>
  classController.getClasses(req, res, next)
);

router.get('/:id', (req, res, next) => classController.getClassById(req, res, next));

router.post('/', validate(createClassSchema), (req, res, next) =>
  classController.createClass(req, res, next)
);

router.put('/:id', (req, res, next) => classController.updateClass(req, res, next));

router.delete('/:id', (req, res, next) => classController.deleteClass(req, res, next));

router.post('/:id/incharge', validate(inchargeSchema), (req, res, next) =>
  classController.assignClassIncharge(req, res, next)
);

export default router;
