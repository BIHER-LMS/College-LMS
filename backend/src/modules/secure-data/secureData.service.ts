import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../utils/errors';

// This module intentionally does not use the older permissive auth middleware: it can
// succeed without an authed_users record. All privileges here come from the DB.
type DB = PrismaClient | Prisma.TransactionClient;
export type Actor = { uid: string; role: string; collegeId: string | null; departmentId: string | null; classId: string | null };
const deny = (message = 'Not authorized') => new AppError(403, 'FORBIDDEN', message);
const missing = () => new AppError(404, 'NOT_FOUND', 'Resource not found');
const conflict = (message = 'Resource has dependent records') => new AppError(409, 'CONFLICT', message);

export const collegeSelect = { id: true, name: true, code: true, domain: true, address: true, city: true, state: true, country: true, phone: true, email: true, website: true, logoUrl: true, adminName: true, adminEmail: true, adminUid: true, isActive: true, createdAt: true } as const;
export const userSelect = { uid: true, email: true, display_name: true, role: true, requested_role: true, approval_status: true, college_id: true, department_id: true, class_id: true, subject_id: true, register_number: true, created_at: true } as const;
const structureSelect = {
  departments: { id: true, college_id: true, name: true, code: true, hod_uid: true, is_active: true, created_at: true },
  programs: { id: true, department_id: true, name: true, type: true, duration_years: true, is_active: true, created_at: true },
  batches: { id: true, program_id: true, start_year: true, end_year: true, is_active: true, created_at: true },
  classes: { id: true, batch_id: true, name: true, current_semester: true, faculty_uid: true, is_active: true, created_at: true },
  subjects: { id: true, department_id: true, name: true, code: true, credits: true, semester_number: true, is_active: true, created_at: true },
} as const;
export type Structure = keyof typeof structureSelect;

export async function publicColleges() {
  return prisma.college.findMany({ where: { isActive: true }, select: { id: true, name: true, code: true }, orderBy: { name: 'asc' }, take: 200 });
}
export async function publicDepartments(collegeId: string) {
  return prisma.department.findMany({ where: { college_id: collegeId, is_active: true, college: { isActive: true } }, select: { id: true, name: true, code: true }, orderBy: { name: 'asc' }, take: 200 });
}
export async function identity(uid: string, email: string | undefined, db: DB = prisma) {
  const record = await db.authedUser.findUnique({ where: { uid }, select: userSelect });
  if (!record || !email || record.email.toLowerCase() !== email.toLowerCase()) throw new AppError(401, 'UNAUTHORIZED', 'Account is not bound to this verified identity');
  return record;
}
export async function activeActor(uid: string, email: string | undefined, db: DB = prisma): Promise<Actor> {
  const a = await identity(uid, email, db);
  if (a.approval_status !== 'APPROVED' || !a.role || !['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD', 'FACULTY', 'STUDENT'].includes(a.role)) throw deny('Active approved role required');
  // The legacy identity is optional during migration. If it exists it MUST agree:
  // disagreement or multiple roles is not resolved by choosing the stronger role.
  const legacy = await db.user.findUnique({ where: { firebaseUid: uid }, select: { email: true, status: true, collegeId: true, userRoles: { select: { role: { select: { name: true, isActive: true } } } } } });
  if (legacy && (legacy.status !== 'ACTIVE' || legacy.email.toLowerCase() !== a.email.toLowerCase() ||
    (legacy.collegeId ?? null) !== (a.college_id ?? null) || legacy.userRoles.length !== 1 ||
    !legacy.userRoles[0].role.isActive || legacy.userRoles[0].role.name !== a.role)) throw deny('Conflicting account assignment');
  if (a.role !== 'SUPER_ADMIN') {
    if (!a.college_id || !(await db.college.findFirst({ where: { id: a.college_id, isActive: true }, select: { id: true } }))) throw deny('Active college required');
  } else if (a.college_id || a.department_id || a.class_id) throw deny('Global administrator must not have tenant assignments');
  if (['HOD', 'FACULTY', 'STUDENT'].includes(a.role)) {
    if (!a.department_id || !await db.department.findFirst({ where: { id: a.department_id, college_id: a.college_id!, is_active: true }, select: { id: true } })) throw deny('Active department required');
    if (a.role === 'HOD' && !await db.department.findFirst({ where: { id: a.department_id, hod_uid: uid, college_id: a.college_id! }, select: { id: true } })) throw deny('HOD assignment required');
    if (a.role === 'STUDENT' && (!a.class_id || !await db.class.findFirst({ where: { id: a.class_id, is_active: true, batch: { program: { department_id: a.department_id, department: { college_id: a.college_id! } } } }, select: { id: true } }))) throw deny('Valid enrollment required');
  }
  if (a.department_id && !await db.department.findFirst({ where: { id: a.department_id, college_id: a.college_id! }, select: { id: true } })) throw deny('Conflicting department');
  if (a.class_id && !await db.class.findFirst({ where: { id: a.class_id, batch: { program: { department_id: a.department_id!, department: { college_id: a.college_id! } } } }, select: { id: true } })) throw deny('Conflicting enrollment');
  if (a.subject_id && !await db.subject.findFirst({ where: { id: a.subject_id, department_id: a.department_id!, department: { college_id: a.college_id! } }, select: { id: true } })) throw deny('Conflicting subject assignment');
  if (a.role === 'FACULTY' && await db.class.count({ where: { faculty_uid: uid, batch: { program: { department_id: { not: a.department_id! } } } } })) throw deny('Conflicting faculty class assignment');
  return { uid, role: a.role, collegeId: a.college_id, departmentId: a.department_id, classId: a.class_id };
}
export function requireRole(a: Actor, role: string) { if (a.role !== role) throw deny(); }
const tenant = (a: Actor) => { if (!a.collegeId) throw deny(); return a.collegeId; };

// Re-check authority inside mutations; serializable transactions prevent competing
// assignments/deletions from passing stale ownership/dependency checks.
async function mutate<T>(a: Actor, email: string, fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async tx => {
    const fresh = await activeActor(a.uid, email, tx);
    if (fresh.role !== a.role || fresh.collegeId !== a.collegeId || fresh.departmentId !== a.departmentId) throw deny();
    if (a.collegeId) await tx.$queryRaw`SELECT id FROM colleges WHERE id = ${a.collegeId} FOR UPDATE`;
    return fn(tx);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
export function ownIdentity(uid: string, email: string) { return identity(uid, email); }
export async function submitOnboardingRequest(
  uid: string,
  email: string,
  input: { college_id: string; requested_role: 'HOD' | 'FACULTY' | 'STUDENT'; department_id?: string | null }
) {
  const current = await identity(uid, email);
  if (current.approval_status === 'APPROVED' && current.role !== 'USER') {
    throw conflict('Account has already been approved');
  }

  const college = await prisma.college.findFirst({ where: { id: input.college_id, isActive: true }, select: { id: true } });
  if (!college) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid or inactive college');

  if (input.department_id) {
    const dept = await prisma.department.findFirst({
      where: { id: input.department_id, college_id: input.college_id, is_active: true },
      select: { id: true }
    });
    if (!dept) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid department for selected college');
  }

  const updated = await prisma.authedUser.update({
    where: { uid },
    data: {
      college_id: input.college_id,
      requested_role: input.requested_role,
      department_id: input.department_id || null,
      approval_status: 'PENDING',
    },
    select: userSelect,
  });

  return updated;
}
export async function listColleges(a: Actor) { requireRole(a, 'SUPER_ADMIN'); return prisma.college.findMany({ select: collegeSelect, orderBy: { createdAt: 'desc' }, take: 500 }); }
export async function createCollege(a: Actor, email: string, data: Prisma.CollegeCreateInput) {
  requireRole(a, 'SUPER_ADMIN');
  return mutate(a, email, tx => tx.college.create({ data, select: collegeSelect }));
}
export async function patchCollege(a: Actor, email: string, id: string, data: Prisma.CollegeUpdateInput) {
  requireRole(a, 'SUPER_ADMIN');
  return mutate(a, email, async tx => {
    if (!await tx.college.findUnique({ where: { id }, select: { id: true } })) throw missing();
    if (data.isActive === false && await tx.authedUser.count({ where: { college_id: id, approval_status: 'APPROVED' } })) throw conflict('Deactivate member accounts first');
    return tx.college.update({ where: { id }, data, select: collegeSelect });
  });
}
export async function deleteCollege(a: Actor, email: string, id: string) {
  requireRole(a, 'SUPER_ADMIN');
  return mutate(a, email, async tx => {
    if (!await tx.college.findUnique({ where: { id }, select: { id: true } })) throw missing();
    const counts = await Promise.all([tx.department.count({ where: { college_id: id } }), tx.authedUser.count({ where: { college_id: id } }), tx.user.count({ where: { collegeId: id } }), tx.accountApproval.count({ where: { requestedCollege: id } }), tx.academicYear.count({ where: { college_id: id } })]);
    if (counts.some(Boolean)) throw conflict();
    await tx.college.delete({ where: { id } });
    return { deleted: true };
  });
}
export async function listUsers(a: Actor, role?: string, departmentId?: string, pending = false) {
  if (!['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'].includes(a.role)) throw deny();
  if (a.role === 'HOD' && role !== 'FACULTY') throw deny();
  if (a.role === 'SUPER_ADMIN' && role !== 'COLLEGE_ADMIN') throw deny();
  if (a.role === 'COLLEGE_ADMIN' && (!role || !['HOD', 'FACULTY', 'STUDENT'].includes(role))) throw deny();
  const college_id = a.role === 'SUPER_ADMIN' ? undefined : tenant(a);
  if (departmentId && (!college_id || !await prisma.department.findFirst({ where: { id: departmentId, college_id }, select: { id: true } }))) throw missing();
  return prisma.authedUser.findMany({ where: { college_id, department_id: a.role === 'HOD' ? a.departmentId! : departmentId,
    role: pending ? 'USER' : role, requested_role: pending ? role : undefined, approval_status: pending ? 'PENDING' : 'APPROVED',
    ...(a.role === 'HOD' ? { requested_role: 'FACULTY' } : {}) }, select: userSelect, take: 200, orderBy: { created_at: 'desc' } });
}
async function checkDepartment(tx: Prisma.TransactionClient, id: string, collegeId: string) {
  if (!await tx.department.findFirst({ where: { id, college_id: collegeId, is_active: true }, select: { id: true } })) throw missing();
}
async function checkFaculty(tx: Prisma.TransactionClient, uid: string, collegeId: string, deptId: string) {
  if (!await tx.authedUser.findFirst({ where: { uid, role: 'FACULTY', approval_status: 'APPROVED', college_id: collegeId, department_id: deptId }, select: { uid: true } })) throw deny('Faculty is not approved in this department');
}
async function checkHod(tx: Prisma.TransactionClient, uid: string, collegeId: string, deptId?: string) {
  if (!await tx.authedUser.findFirst({ where: { uid, role: 'HOD', approval_status: 'APPROVED', college_id: collegeId, ...(deptId ? { OR: [{ department_id: deptId }, { department_id: null }] } : { department_id: null }) }, select: { uid: true } })) throw deny('HOD is not eligible');
  if (await tx.department.count({ where: { hod_uid: uid, ...(deptId ? { id: { not: deptId } } : {}) } })) throw conflict('HOD already heads a department');
}
async function scope(tx: DB, type: Structure, a: Actor, id: string) {
  const c = tenant(a);
  if (type === 'departments') return tx.department.findFirst({ where: { id, college_id: c }, select: structureSelect.departments });
  if (type === 'programs') return tx.program.findFirst({ where: { id, department: { college_id: c } }, select: structureSelect.programs });
  if (type === 'subjects') return tx.subject.findFirst({ where: { id, department: { college_id: c } }, select: structureSelect.subjects });
  if (type === 'batches') return tx.batch.findFirst({ where: { id, program: { department: { college_id: c } } }, select: structureSelect.batches });
  return tx.class.findFirst({ where: { id, batch: { program: { department: { college_id: c } } } }, select: structureSelect.classes });
}
async function parent(tx: DB, type: Structure, a: Actor, id: string) {
  const c = tenant(a);
  if (type === 'departments') { if (id !== c) throw missing(); return { departmentId: null }; }
  if (type === 'subjects' || type === 'programs') {
    const d = await tx.department.findFirst({ where: { id, college_id: c, is_active: true }, select: { id: true } });
    if (!d) throw missing(); return { departmentId: d.id };
  }
  if (type === 'batches') {
    const p = await tx.program.findFirst({ where: { id, is_active: true, department: { college_id: c, is_active: true } }, select: { department_id: true } });
    if (!p) throw missing(); return { departmentId: p.department_id };
  }
  const b = await tx.batch.findFirst({ where: { id, is_active: true, program: { is_active: true, department: { college_id: c, is_active: true } } }, select: { program: { select: { department_id: true } } } });
  if (!b) throw missing(); return { departmentId: b.program.department_id };
}
const parentField: Record<Structure, string> = { departments: 'college_id', programs: 'department_id', batches: 'program_id', classes: 'batch_id', subjects: 'department_id' };
export async function listStructure(a: Actor, type: Structure, parentId: string) {
  if (a.role === 'SUPER_ADMIN' || !a.collegeId) throw deny();
  const p = await parent(prisma, type, a, parentId);
  if (['HOD', 'FACULTY', 'STUDENT'].includes(a.role) &&
    (type === 'departments' ? parentId !== a.collegeId : p.departmentId !== a.departmentId)) throw missing();
  // Students see only their own class, faculty only classes explicitly assigned to them.
  switch (type) {
    case 'departments': return prisma.department.findMany({ where: { college_id: parentId, ...(a.departmentId ? { id: a.departmentId } : {}) }, select: structureSelect.departments, take: 200 });
    case 'programs': return prisma.program.findMany({ where: { department_id: parentId }, select: structureSelect.programs, take: 200 });
    case 'batches': return prisma.batch.findMany({ where: { program_id: parentId }, select: structureSelect.batches, take: 200 });
    case 'subjects': return prisma.subject.findMany({ where: { department_id: parentId }, select: structureSelect.subjects, take: 200 });
    case 'classes': return prisma.class.findMany({ where: { batch_id: parentId, ...(a.role === 'STUDENT' ? { id: a.classId! } : a.role === 'FACULTY' ? { faculty_uid: a.uid } : {}) }, select: structureSelect.classes, take: 200 });
  }
}
export async function createStructure(a: Actor, email: string, type: Structure, parentId: string, data: any) {
  requireRole(a, 'COLLEGE_ADMIN');
  return mutate(a, email, async tx => {
    const p = await parent(tx, type, a, parentId);
    if (type === 'departments' && data.hod_uid) await checkHod(tx, data.hod_uid, tenant(a));
    if (type === 'classes' && data.faculty_uid) await checkFaculty(tx, data.faculty_uid, tenant(a), p.departmentId!);
    const values = { ...data, [parentField[type]]: parentId };
    switch (type) {
      case 'departments': {
        const row = await tx.department.create({ data: values, select: structureSelect.departments });
        if (data.hod_uid) await tx.authedUser.update({ where: { uid: data.hod_uid }, data: { department_id: row.id } });
        return row;
      }
      case 'programs': return tx.program.create({ data: values, select: structureSelect.programs });
      case 'batches': return tx.batch.create({ data: values, select: structureSelect.batches });
      case 'classes': return tx.class.create({ data: values, select: structureSelect.classes });
      case 'subjects': return tx.subject.create({ data: values, select: structureSelect.subjects });
    }
  });
}
export async function patchStructure(a: Actor, email: string, type: Structure, id: string, data: any) {
  requireRole(a, 'COLLEGE_ADMIN');
  return mutate(a, email, async tx => {
    const old = await scope(tx, type, a, id);
    if (!old) throw missing();
    if (type === 'departments' && data.hod_uid !== undefined) {
      if (data.hod_uid) await checkHod(tx, data.hod_uid, tenant(a), id);
      const existing = await tx.department.findUnique({ where: { id }, select: { hod_uid: true } });
      if (existing?.hod_uid && existing.hod_uid !== data.hod_uid) await tx.authedUser.updateMany({ where: { uid: existing.hod_uid, department_id: id }, data: { department_id: null } });
      if (data.hod_uid) await tx.authedUser.update({ where: { uid: data.hod_uid }, data: { department_id: id } });
    }
    if (type === 'classes' && data.faculty_uid) {
      const current = await tx.class.findUnique({ where: { id }, select: { batch_id: true } });
      const p = await parent(tx, type, a, current!.batch_id);
      await checkFaculty(tx, data.faculty_uid, tenant(a), p.departmentId!);
      await tx.class.updateMany({ where: { faculty_uid: data.faculty_uid, batch: { program: { department: { college_id: tenant(a) } } } }, data: { faculty_uid: null } });
    }
    switch (type) {
      case 'departments': return tx.department.update({ where: { id }, data, select: structureSelect.departments });
      case 'programs': return tx.program.update({ where: { id }, data, select: structureSelect.programs });
      case 'batches': return tx.batch.update({ where: { id }, data, select: structureSelect.batches });
      case 'classes': return tx.class.update({ where: { id }, data, select: structureSelect.classes });
      case 'subjects': return tx.subject.update({ where: { id }, data, select: structureSelect.subjects });
    }
  });
}
export async function deleteStructure(a: Actor, email: string, type: Structure, id: string) {
  requireRole(a, 'COLLEGE_ADMIN');
  return mutate(a, email, async tx => {
    if (!await scope(tx, type, a, id)) throw missing();
    // Never use cascading cleanup: soft-disable rows which may have historical
    // attendance/timetable references; only delete empty leaf academic rows.
    if (type === 'departments' && (await tx.program.count({ where: { department_id: id } }) || await tx.subject.count({ where: { department_id: id } }) || await tx.authedUser.count({ where: { department_id: id } }))) throw conflict();
    if (type === 'programs' && await tx.batch.count({ where: { program_id: id } })) throw conflict();
    if (type === 'batches' && await tx.class.count({ where: { batch_id: id } })) throw conflict();
    // Class/subject may be referenced in tables outside Prisma; do not hard-delete.
    if (type === 'classes' || type === 'subjects') throw conflict('Archive this resource instead of deleting historical records');
    if (type === 'departments') await tx.department.delete({ where: { id } });
    if (type === 'programs') await tx.program.delete({ where: { id } });
    if (type === 'batches') await tx.batch.delete({ where: { id } });
    return { deleted: true };
  });
}
export async function stats(a: Actor) {
  requireRole(a, 'COLLEGE_ADMIN'); const c = tenant(a);
  const [students, faculty, hods, departments, programs, subjects] = await Promise.all([
    ...(['STUDENT', 'FACULTY', 'HOD'] as const).map(role => prisma.authedUser.count({ where: { college_id: c, role, approval_status: 'APPROVED' } })),
    prisma.department.count({ where: { college_id: c } }), prisma.program.count({ where: { department: { college_id: c } } }), prisma.subject.count({ where: { department: { college_id: c } } }),
  ]);
  return { students, faculty, hods, departments, programs, subjects };
}
export async function assignUser(a: Actor, email: string, uid: string, data: { department_id?: string | null; class_id?: string | null; subject_id?: string | null; register_number?: string | null }) {
  requireRole(a, 'COLLEGE_ADMIN');
  return mutate(a, email, async tx => {
    const old = await tx.authedUser.findFirst({ where: { uid, college_id: tenant(a), role: { in: ['STUDENT', 'FACULTY', 'HOD'] }, approval_status: 'APPROVED' }, select: userSelect });
    if (!old || uid === a.uid) throw missing();
    const dep = data.department_id === undefined ? old.department_id : data.department_id;
    if (dep) await checkDepartment(tx, dep, tenant(a));
    if (old.role === 'HOD' && data.department_id !== undefined) throw deny('Assign HOD via department endpoint');
    if (old.role === 'FACULTY' && !dep) throw deny('Faculty requires department');
    if (old.role === 'STUDENT' && !dep) throw deny('Student requires department');
    if (data.class_id !== undefined && data.class_id && (!dep || !await tx.class.findFirst({ where: { id: data.class_id, batch: { program: { department_id: dep, department: { college_id: tenant(a) } } } }, select: { id: true } }))) throw missing();
    if (data.subject_id !== undefined && data.subject_id && (old.role !== 'FACULTY' || !dep || !await tx.subject.findFirst({ where: { id: data.subject_id, department_id: dep, department: { college_id: tenant(a) } }, select: { id: true } }))) throw missing();
    if (data.register_number !== undefined && old.role !== 'STUDENT') throw deny();
    if (old.role === 'STUDENT' && data.department_id !== undefined && old.class_id && data.department_id !== old.department_id && data.class_id === undefined) throw conflict('Reassign enrollment with department');
    if (old.role === 'FACULTY' && data.department_id !== undefined && old.department_id !== dep && (await tx.class.count({ where: { faculty_uid: uid } }) || old.subject_id && data.subject_id === undefined)) throw conflict('Clear faculty assignments first');
    const result = await tx.authedUser.updateMany({ where: { uid, college_id: tenant(a), role: old.role, approval_status: 'APPROVED' }, data });
    if (result.count !== 1) throw conflict('Account changed during update');
    return tx.authedUser.findUnique({ where: { uid }, select: userSelect });
  });
}
export async function review(a: Actor, email: string, uid: string, decision: 'APPROVED' | 'REJECTED') {
  if (!['SUPER_ADMIN', 'COLLEGE_ADMIN', 'HOD'].includes(a.role)) throw deny();
  return mutate(a, email, async tx => {
    const old = await tx.authedUser.findUnique({ where: { uid }, select: userSelect });
    if (!old || old.role !== 'USER' || old.approval_status !== 'PENDING' || uid === a.uid) throw missing();
    const target = old.requested_role;
    if (!target || (a.role === 'SUPER_ADMIN' ? target !== 'COLLEGE_ADMIN' : a.role === 'HOD' ? target !== 'FACULTY' : !['HOD', 'FACULTY', 'STUDENT'].includes(target))) throw deny();
    if (a.role !== 'SUPER_ADMIN' && old.college_id !== a.collegeId) throw missing();
    if (a.role === 'HOD' && old.department_id !== a.departmentId) throw missing();
    if (!old.college_id || !await tx.college.findFirst({ where: { id: old.college_id, isActive: true }, select: { id: true } })) throw missing();
    if (old.department_id) await checkDepartment(tx, old.department_id, old.college_id);
    if (target === 'HOD' && !old.department_id) throw conflict('HOD requires assigned department');
    if (target === 'FACULTY' && !old.department_id) throw conflict('Faculty requires assigned department');
    if (target === 'STUDENT' && (!old.department_id || !old.class_id || !await tx.class.findFirst({ where: { id: old.class_id, batch: { program: { department_id: old.department_id, department: { college_id: old.college_id } } } }, select: { id: true } }))) throw conflict('Student requires valid class enrollment');
    if (old.class_id && (!old.department_id || !await tx.class.findFirst({ where: { id: old.class_id, batch: { program: { department_id: old.department_id, department: { college_id: old.college_id } } } }, select: { id: true } }))) throw conflict('Invalid class assignment');
    if (old.subject_id && (!old.department_id || !await tx.subject.findFirst({ where: { id: old.subject_id, department_id: old.department_id, department: { college_id: old.college_id } }, select: { id: true } }))) throw conflict('Invalid subject assignment');
    const legacy = await tx.user.findUnique({ where: { firebaseUid: uid }, select: { id: true, status: true, collegeId: true, userRoles: { select: { role: { select: { name: true } } } } } });
    // Do not mint a privileged authed_users role while a conflicting legacy grant exists.
    if (legacy && (legacy.collegeId !== old.college_id || legacy.status === 'DISABLED' || legacy.status === 'SUSPENDED' || legacy.status === 'REJECTED' || legacy.userRoles.some(r => r.role.name !== target))) throw deny('Reconcile legacy account first');
    if (legacy) {
      const requests = await tx.accountApproval.findMany({ where: { userId: legacy.id, status: 'PENDING' }, select: { requestedRole: true, requestedCollege: true } });
      if (requests.some(r => r.requestedRole !== target || r.requestedCollege !== old.college_id)) throw deny('Conflicting legacy approval request');
      await tx.accountApproval.updateMany({ where: { userId: legacy.id, status: 'PENDING', requestedRole: target as any, requestedCollege: old.college_id }, data: { status: decision, reviewedAt: new Date() } });
    }
    const result = await tx.authedUser.updateMany({ where: { uid, role: 'USER', approval_status: 'PENDING', college_id: old.college_id, requested_role: target }, data: { role: decision === 'APPROVED' ? target : 'USER', approval_status: decision } });
    if (result.count !== 1) throw conflict('Request has already been reviewed');
    if (legacy) {
      if (decision === 'APPROVED') {
        const role = await tx.role.findUnique({ where: { name: target as any }, select: { id: true, isActive: true } });
        if (!role?.isActive) throw conflict('Role is unavailable');
        if (!legacy.userRoles.length) await tx.userRole.create({ data: { userId: legacy.id, roleId: role.id, assignedBy: a.uid } });
      }
      await tx.user.update({ where: { id: legacy.id }, data: { status: decision === 'APPROVED' ? 'ACTIVE' : 'REJECTED' } });
    }
    if (target === 'HOD' && decision === 'APPROVED') {
      const dep = await tx.department.findFirst({ where: { id: old.department_id!, college_id: old.college_id }, select: { hod_uid: true } });
      if (dep?.hod_uid && dep.hod_uid !== uid) throw conflict('Department already has a HOD');
      await tx.department.update({ where: { id: old.department_id! }, data: { hod_uid: uid } });
    }
    if (target === 'COLLEGE_ADMIN' && decision === 'APPROVED') {
      const college = await tx.college.findUnique({ where: { id: old.college_id }, select: { adminUid: true } });
      if (college?.adminUid && college.adminUid !== uid) throw conflict('College already has an administrator');
      await tx.college.update({ where: { id: old.college_id }, data: { adminUid: uid, adminName: old.display_name, adminEmail: old.email } });
    }
    const reviewer = await tx.user.findUnique({ where: { firebaseUid: a.uid }, select: { id: true } });
    await tx.auditLog.create({ data: { action: decision === 'APPROVED' ? 'ACCOUNT_APPROVED' : 'ACCOUNT_REJECTED', actorId: reviewer?.id ?? null, subjectId: legacy?.id ?? null, collegeId: old.college_id, metadata: { reviewerUid: a.uid, subjectUid: uid, role: target, source: 'secure-data' } } });
    return tx.authedUser.findUnique({ where: { uid }, select: userSelect });
  });
}
