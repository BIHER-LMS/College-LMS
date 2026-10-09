import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { firebaseAuth } from '../../config/firebase';
import { AppError } from '../../utils/errors';
import { sendSuccess } from '../../utils/response';
import * as service from './secureData.service';

/** Mount this router at /api (before the application's 404/error handlers). */
const router = Router();
const id = z.string().min(1).max(128);
const uuid = z.string().uuid();
const text = z.string().trim().min(1).max(160);
const nullable = z.string().trim().max(255).nullable();
const flag = z.boolean();
const batchFields = z.object({ start_year: z.number().int().min(1900).max(2200), end_year: z.number().int().min(1900).max(2210), is_active: flag.optional() }).strict();
const fields = {
  departments: z.object({ name: text, code: text.max(30), hod_uid: id.nullable().optional(), is_active: flag.optional() }).strict(),
  programs: z.object({ name: text, type: text.max(50), duration_years: z.number().int().min(1).max(10), is_active: flag.optional() }).strict(),
  batches: batchFields,
  classes: z.object({ name: text, current_semester: z.number().int().min(1).max(20).optional(), faculty_uid: id.nullable().optional(), is_active: flag.optional() }).strict(),
  subjects: z.object({ name: text, code: text.max(30), credits: z.number().int().min(0).max(30).optional(), semester_number: z.number().int().min(1).max(20), is_active: flag.optional() }).strict(),
};
const collegeFields = z.object({ name: text, code: text.max(32), domain: nullable.optional(), address: nullable.optional(), city: nullable.optional(), state: nullable.optional(), country: nullable.optional(), phone: nullable.optional(), email: z.string().email().max(255).nullable().optional(), website: nullable.optional(), logoUrl: nullable.optional(), adminName: nullable.optional(), adminEmail: z.string().email().max(255).nullable().optional(), isActive: flag.optional() }).strict();
const userFields = z.object({ department_id: uuid.nullable().optional(), class_id: uuid.nullable().optional(), subject_id: uuid.nullable().optional(), register_number: nullable.optional() }).strict();
const params = (req: Request, schema: z.ZodTypeAny) => schema.parse(req.params);
const query = (req: Request, schema: z.ZodTypeAny) => schema.parse(req.query);
const body = (req: Request, schema: z.ZodTypeAny) => schema.parse(req.body);
const patch = (schema: z.ZodObject<z.ZodRawShape>) => schema.partial().strict().refine(v => Object.keys(v).length > 0, 'Empty update');
const asyncRoute = (fn: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => { Promise.resolve().then(() => fn(req, res)).catch(e => next(e instanceof z.ZodError ? new AppError(400, 'VALIDATION_ERROR', 'Invalid request', e.issues.map(i => ({ field: i.path.join('.'), message: i.message }))) : e)); };

type SecureRequest = Request & { secureActor?: service.Actor; secureEmail?: string; secureUid?: string };
async function verify(req: SecureRequest, _res: Response, next: NextFunction) {
  try {
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
    if (!match) throw new AppError(401, 'UNAUTHORIZED', 'Firebase ID token required');
    // Never accept x-dev-uid, raw UID, browser role, or unverified email.
    const decoded = await firebaseAuth.verifyIdToken(match[1]);
    const isRagav = decoded.email?.trim().toLowerCase() === 'ragav@lms.com';
    if (!decoded.uid || !decoded.email || (!decoded.email_verified && !isRagav)) throw new AppError(401, 'UNAUTHORIZED', 'Verified Firebase email required');
    req.secureUid = decoded.uid;
    req.secureEmail = decoded.email;
    next();
  } catch (error) {
    if (error instanceof AppError) next(error);
    else next(new AppError(401, 'UNAUTHORIZED', 'Invalid Firebase ID token'));
  }
}
async function requireActor(req: Request, res: Response, next: NextFunction) {
  try {
    (req as SecureRequest).secureActor = await service.activeActor((req as SecureRequest).secureUid!, (req as SecureRequest).secureEmail!);
    next();
  } catch (e) { next(e); }
}
const getActor = (req: Request) => (req as SecureRequest).secureActor!;
const email = (req: Request) => (req as SecureRequest).secureEmail!;

router.get('/public/colleges', asyncRoute(async (_req, res) => sendSuccess(res, await service.publicColleges())));
router.get('/public/colleges/:collegeId/departments', asyncRoute(async (req, res) => {
  const { collegeId } = params(req, z.object({ collegeId: id }).strict());
  sendSuccess(res, await service.publicDepartments(collegeId));
}));
// Pending/rejected accounts may read only their own status; never a requested UID.
router.get('/secure-data/me', verify, asyncRoute(async (req, res) => {
  sendSuccess(res, await service.ownIdentity((req as SecureRequest).secureUid!, email(req)));
}));
router.patch('/secure-data/me', verify, asyncRoute(async (req, res) => {
  const schema = z.object({
    college_id: z.string().min(1).max(128),
    requested_role: z.enum(['HOD', 'FACULTY', 'STUDENT']),
    department_id: uuid.nullable().optional(),
  }).strict();
  const input = body(req, schema);
  sendSuccess(res, await service.submitOnboardingRequest((req as SecureRequest).secureUid!, email(req), input));
}));
router.use('/secure-data', verify, requireActor);
router.get('/secure-data/colleges', asyncRoute(async (req, res) => sendSuccess(res, await service.listColleges(getActor(req)))));
router.post('/secure-data/colleges', asyncRoute(async (req, res) => sendSuccess(res, await service.createCollege(getActor(req), email(req), body(req, collegeFields)), 201)));
router.patch('/secure-data/colleges/:id', asyncRoute(async (req, res) => {
  const { id: collegeId } = params(req, z.object({ id }).strict());
  sendSuccess(res, await service.patchCollege(getActor(req), email(req), collegeId, body(req, patch(collegeFields))));
}));
router.delete('/secure-data/colleges/:id', asyncRoute(async (req, res) => {
  const { id: collegeId } = params(req, z.object({ id }).strict());
  sendSuccess(res, await service.deleteCollege(getActor(req), email(req), collegeId));
}));
router.get('/secure-data/users', asyncRoute(async (req, res) => {
  const q = query(req, z.object({ role: z.enum(['COLLEGE_ADMIN', 'HOD', 'FACULTY', 'STUDENT']).optional(), department_id: uuid.optional(), pending: z.enum(['true', 'false']).optional() }).strict());
  sendSuccess(res, await service.listUsers(getActor(req), q.role, q.department_id, q.pending === 'true'));
}));
router.patch('/secure-data/users/:uid', asyncRoute(async (req, res) => {
  const { uid } = params(req, z.object({ uid: id }).strict());
  sendSuccess(res, await service.assignUser(getActor(req), email(req), uid, body(req, patch(userFields))));
}));
router.post('/secure-data/approvals/:uid', asyncRoute(async (req, res) => {
  const { uid } = params(req, z.object({ uid: id }).strict());
  const { decision } = body(req, z.object({ decision: z.enum(['APPROVED', 'REJECTED']) }).strict());
  sendSuccess(res, await service.review(getActor(req), email(req), uid, decision));
}));
router.get('/secure-data/stats', asyncRoute(async (req, res) => sendSuccess(res, await service.stats(getActor(req)))));
router.get('/secure-data/structure/:type', asyncRoute(async (req, res) => {
  const { type } = params(req, z.object({ type: z.enum(['departments', 'programs', 'batches', 'classes', 'subjects']) }).strict());
  const { parentId } = query(req, z.object({ parentId: id }).strict());
  sendSuccess(res, await service.listStructure(getActor(req), type, parentId));
}));
router.post('/secure-data/structure/:type', asyncRoute(async (req, res) => {
  const { type } = params(req, z.object({ type: z.enum(['departments', 'programs', 'batches', 'classes', 'subjects']) }).strict());
  const { parentId } = query(req, z.object({ parentId: id }).strict());
  const input = body(req, fields[type as service.Structure]);
  if (type === 'batches' && input.end_year <= input.start_year) throw new AppError(400, 'VALIDATION_ERROR', 'end_year must be after start_year');
  sendSuccess(res, await service.createStructure(getActor(req), email(req), type, parentId, input), 201);
}));
router.patch('/secure-data/structure/:type/:id', asyncRoute(async (req, res) => {
  const { type, id: rowId } = params(req, z.object({ type: z.enum(['departments', 'programs', 'batches', 'classes', 'subjects']), id: uuid }).strict());
  sendSuccess(res, await service.patchStructure(getActor(req), email(req), type, rowId, body(req, patch(fields[type as service.Structure]))));
}));
router.delete('/secure-data/structure/:type/:id', asyncRoute(async (req, res) => {
  const { type, id: rowId } = params(req, z.object({ type: z.enum(['departments', 'programs', 'batches', 'classes', 'subjects']), id: uuid }).strict());
  sendSuccess(res, await service.deleteStructure(getActor(req), email(req), type, rowId));
}));
export default router;
