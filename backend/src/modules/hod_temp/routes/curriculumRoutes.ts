import { Router } from 'express';
import { curriculumController } from '../controllers/curriculumController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const updateCurriculumSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    completionPercentage: z.number().min(0).max(100).optional(),
    modulesBehind: z.number().int().min(0).optional(),
  }),
};

router.use(requireAuth);

router.get('/', (req, res, next) => curriculumController.getCurriculum(req, res, next));
router.put('/:id', validate(updateCurriculumSchema), (req, res, next) =>
  curriculumController.updateCurriculum(req, res, next)
);

export default router;
