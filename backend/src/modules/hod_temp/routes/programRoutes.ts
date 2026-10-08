import { Router } from 'express';
import { programController } from '../controllers/programController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const createProgramSchema = {
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(1),
    degree: z.string().min(1),
    durationYears: z.number().int().positive(),
    departmentId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

router.use(requireAuth);

router.get('/', (req, res, next) => programController.getPrograms(req, res, next));
router.get('/:id', (req, res, next) => programController.getProgramById(req, res, next));
router.post('/', validate(createProgramSchema), (req, res, next) =>
  programController.createProgram(req, res, next)
);
router.put('/:id', (req, res, next) => programController.updateProgram(req, res, next));
router.delete('/:id', (req, res, next) => programController.deleteProgram(req, res, next));

export default router;
