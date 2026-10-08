import { Router } from 'express';
import { academicYearController } from '../controllers/academicYearController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { z } from 'zod';

export const academicYearRouter = Router();
export const semesterRouter = Router();

const createAYSchema = {
  body: z.object({
    name: z.string().min(2),
    startDate: z.string().min(4),
    endDate: z.string().min(4),
    isCurrent: z.boolean().optional(),
  }),
};

const createSemesterSchema = {
  body: z.object({
    termNumber: z.number().int().positive(),
    startDate: z.string().min(4),
    endDate: z.string().min(4),
    academicYearId: z.string().min(1),
  }),
};

academicYearRouter.use(requireAuth);
academicYearRouter.get('/', (req, res, next) => academicYearController.getAcademicYears(req, res, next));
academicYearRouter.post('/', validate(createAYSchema), (req, res, next) =>
  academicYearController.createAcademicYear(req, res, next)
);

semesterRouter.use(requireAuth);
semesterRouter.get('/', (req, res, next) => academicYearController.getSemesters(req, res, next));
semesterRouter.post('/', validate(createSemesterSchema), (req, res, next) =>
  academicYearController.createSemester(req, res, next)
);
