import { Router } from 'express';
import { departmentController } from '../controllers/departmentController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const updateDepartmentSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().min(1).optional(),
    collegeName: z.string().min(2).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

router.use(requireAuth);

router.get('/:id?', (req, res, next) => departmentController.getDepartment(req, res, next));
router.put('/:id', validate(updateDepartmentSchema), (req, res, next) =>
  departmentController.updateDepartment(req, res, next)
);

export default router;
