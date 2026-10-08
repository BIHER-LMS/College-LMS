import { Router } from 'express';
import { facultyController } from '../controllers/facultyController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

const router = Router();

const querySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    departmentId: z.string().optional(),
  }),
};

const createFacultySchema = {
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(5, 'Phone number is required'),
    designation: z.string().min(2, 'Designation is required'),
    departmentId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
};

router.use(requireAuth);

router.get('/', validate(querySchema), (req, res, next) =>
  facultyController.getFaculty(req, res, next)
);

router.get('/:id', (req, res, next) => facultyController.getFacultyById(req, res, next));

router.post('/', validate(createFacultySchema), (req, res, next) =>
  facultyController.createFaculty(req, res, next)
);

router.put('/:id', (req, res, next) => facultyController.updateFaculty(req, res, next));

router.delete('/:id', (req, res, next) => facultyController.deleteFaculty(req, res, next));

export default router;
