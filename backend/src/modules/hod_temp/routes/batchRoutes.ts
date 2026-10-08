import { Router } from 'express';
import { batchController } from '../controllers/batchController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const createBatchSchema = {
  body: z.object({
    name: z.string().min(2),
    programId: z.string().min(1),
    startYear: z.number().int().min(2000),
    endYear: z.number().int().min(2000),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

router.use(requireAuth);

router.get('/', (req, res, next) => batchController.getBatches(req, res, next));
router.get('/:id', (req, res, next) => batchController.getBatchById(req, res, next));
router.post('/', validate(createBatchSchema), (req, res, next) =>
  batchController.createBatch(req, res, next)
);
router.put('/:id', (req, res, next) => batchController.updateBatch(req, res, next));
router.delete('/:id', (req, res, next) => batchController.deleteBatch(req, res, next));

export default router;
