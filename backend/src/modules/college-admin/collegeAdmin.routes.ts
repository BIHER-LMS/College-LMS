import { Router } from 'express';
import { authenticateFirebaseUser, requireUser } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateCollegeProfileSchema, createDepartmentSchema } from '../../schemas/collegeAdmin.schema';
import { createVaultDocumentSchema } from '../../schemas/collegeAdminRagVault.schema';
import {
  getProfileHandler,
  updateProfileHandler,
  createDepartmentHandler,
  uploadVaultDocHandler,
  listVaultDocsHandler,
  deleteVaultDocHandler,
  getVaultStatsHandler,
} from './collegeAdmin.controller';

const router = Router();

// Apply auth and role middleware to all routes in this router
router.use(authenticateFirebaseUser, requireUser, requireRole('COLLEGE_ADMIN'));

/**
 * GET /api/college-admin/college/profile
 * Get the authenticated College Admin's college profile
 */
router.get('/college/profile', getProfileHandler);

/**
 * PATCH /api/college-admin/college/profile
 * Update the authenticated College Admin's college profile
 */
router.patch('/college/profile', validate(updateCollegeProfileSchema), updateProfileHandler);

/**
 * POST /api/college-admin/departments
 * Create a new department for the authenticated College Admin's college
 */
router.post('/departments', validate(createDepartmentSchema), createDepartmentHandler);

/**
 * RAG Vault Routes for Institutional Policies, Dress Code, Handbook, and General Info
 */
router.get('/rag-vault/stats', getVaultStatsHandler);
router.get('/rag-vault/documents', listVaultDocsHandler);
router.post('/rag-vault/documents', validate(createVaultDocumentSchema), uploadVaultDocHandler);
router.delete('/rag-vault/documents/:id', deleteVaultDocHandler);

export default router;

