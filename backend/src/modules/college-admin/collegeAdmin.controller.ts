import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { getCollegeProfile, updateCollegeProfile, createDepartment } from './collegeAdmin.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/errors';
import { ErrorCodes } from '../../utils/response';

export async function getProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || !user.collegeId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'No college is assigned to this account.');
    }

    const college = await getCollegeProfile(user.collegeId);
    sendSuccess(res, college);
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || !user.collegeId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'No college is assigned to this account.');
    }

    // Only authorized fields are passed through via Zod validation
    const updatedCollege = await updateCollegeProfile(user.id, user.collegeId, req.body);
    sendSuccess(res, updatedCollege);
  } catch (error) {
    next(error);
  }
}

export async function createDepartmentHandler(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user || !user.collegeId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'No college is assigned to this account.');
    }

    const department = await createDepartment(user.collegeId, req.body);
    sendSuccess(res, department, 201);
  } catch (error) {
    next(error);
  }
}
