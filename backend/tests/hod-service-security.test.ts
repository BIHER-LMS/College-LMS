import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HODContext } from '../src/modules/hod_temp/middleware/authMiddleware';

vi.mock('../src/modules/hod_temp/config/db', () => ({
  prisma: {
    department: { findFirst: vi.fn(), findUnique: vi.fn() },
    academicYear: { findMany: vi.fn(), findFirst: vi.fn() },
    semester: { findMany: vi.fn() },
    authedUser: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    program: { count: vi.fn() }, batch: { count: vi.fn() },
    class: { count: vi.fn(), findMany: vi.fn() }, subject: { count: vi.fn() },
    $transaction: vi.fn(),
  },
}));
import { prisma } from '../src/modules/hod_temp/config/db';
import { facultyService } from '../src/modules/hod_temp/services/facultyService';
import { hodService } from '../src/modules/hod_temp/services/hodService';

const db = prisma as any;
const hod: HODContext = {
  uid: 'hod-a', email: 'hod@example.org', displayName: 'HOD', photoUrl: null,
  role: 'HOD', departmentId: 'dept-a', collegeId: 'college-a',
};
const dept = { id: 'dept-a', college_id: 'college-a', is_active: true };
const applicant = {
  uid: 'applicant', role: 'USER', requested_role: 'FACULTY',
  approval_status: 'PENDING', department_id: dept.id, college_id: dept.college_id,
};
const tx = {
  authedUser: { findFirst: vi.fn(), updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
  subject: { findFirst: vi.fn() },
  class: { findFirst: vi.fn(), updateMany: vi.fn() },
  user: { findUnique: vi.fn(), updateMany: vi.fn() },
  accountApproval: { findFirst: vi.fn(), updateMany: vi.fn() },
};

beforeEach(() => {
  vi.resetAllMocks();
  db.department.findFirst.mockImplementation(({ where }: any) =>
    Promise.resolve(where.id === dept.id && where.college_id === dept.college_id ? dept : null));
  db.$transaction.mockImplementation((run: (tx: typeof tx) => unknown) => run(tx));
  tx.authedUser.findFirst.mockResolvedValue(applicant);
  tx.authedUser.updateMany.mockResolvedValue({ count: 1 });
  tx.authedUser.findUniqueOrThrow.mockResolvedValue({ ...applicant, role: 'FACULTY' });
  tx.user.findUnique.mockResolvedValue(null);
  tx.user.updateMany.mockResolvedValue({ count: 1 });
  tx.subject.findFirst.mockResolvedValue({ id: 'subject-a' });
  tx.class.findFirst.mockResolvedValue(null);
  tx.class.updateMany.mockResolvedValue({ count: 1 });
  tx.accountApproval.findFirst.mockResolvedValue({ id: 'request-a' });
  tx.accountApproval.updateMany.mockResolvedValue({ count: 1 });
});

describe('college-scoped HOD academic data', () => {
  it('filters years and semesters by the assigned college', async () => {
    db.academicYear.findMany.mockResolvedValue([]);
    db.semester.findMany.mockResolvedValue([]);
    await hodService.getAcademicYears(hod);
    await hodService.getSemesters(hod);
    expect(db.academicYear.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { college_id: 'college-a' } }));
    expect(db.semester.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { academicYear: { college_id: 'college-a' } } }));
    await expect(hodService.getAcademicYears({ ...hod, collegeId: null })).rejects.toMatchObject({ statusCode: 403 });
    expect(db.academicYear.findMany).toHaveBeenCalledTimes(1);
  });

  it('never falls back to a global dashboard academic year', async () => {
    db.department.findUnique.mockResolvedValue({ ...dept, college: {}, hod: null });
    db.authedUser.count.mockResolvedValue(0);
    db.program.count.mockResolvedValue(0);
    db.batch.count.mockResolvedValue(0);
    db.class.count.mockResolvedValue(0);
    db.subject.count.mockResolvedValue(0);
    db.academicYear.findFirst.mockResolvedValue(null);
    db.class.findMany.mockResolvedValue([]);
    await hodService.getDashboard(hod);
    expect(db.academicYear.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { college_id: 'college-a' } }));
    await expect(hodService.getDashboard({ ...hod, collegeId: 'college-b' })).rejects.toMatchObject({ statusCode: 404 });
  });

  it('limits student detail to both the HOD department and its college, without invented attendance', async () => {
    db.authedUser.findFirst.mockResolvedValue({ ...applicant, role: 'STUDENT', class: null });
    const student = await hodService.getStudentById(hod, 'student-a');
    expect(db.authedUser.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({
      uid: 'student-a', role: 'STUDENT', department_id: dept.id, college_id: dept.college_id,
      OR: expect.arrayContaining([expect.objectContaining({ class: expect.any(Object) })]),
    }) }));
    expect(student.attendancePercentage).toBeNull();
    expect(student.attendanceRecords).toEqual([]);
    db.authedUser.findFirst.mockResolvedValue(null);
    await expect(hodService.getStudentById(hod, 'foreign')).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('HOD faculty review', () => {
  it('requires explicit scoped HOD context; neither ID nor request body grants authority', async () => {
    await expect(facultyService.approveApplication('applicant', { action: 'APPROVE' })).rejects.toMatchObject({ statusCode: 403 });
    await expect(facultyService.getPendingApplications('dept-a')).rejects.toMatchObject({ statusCode: 403 });
    await expect(facultyService.getFacultyList()).rejects.toMatchObject({ statusCode: 403 });
    await expect(facultyService.getFacultyById('applicant')).rejects.toMatchObject({ statusCode: 403 });
    await expect(facultyService.approveApplication('applicant', { action: 'APPROVE' }, { ...hod, collegeId: 'college-b' })).rejects.toMatchObject({ statusCode: 403 });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('lists only pending requested faculty from both the verified department and college', async () => {
    db.authedUser.findMany.mockResolvedValue([]);
    await facultyService.getPendingApplications('dept-a', hod);
    expect(db.authedUser.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({
      department_id: 'dept-a', college_id: 'college-a', requested_role: 'FACULTY',
      approval_status: { in: ['PENDING', 'pending'] },
    }) }));
    await expect(facultyService.getPendingApplications('dept-b', hod)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('rejects non-pending or cross-tenant applicants without updating them', async () => {
    tx.authedUser.findFirst.mockResolvedValue(null);
    await expect(facultyService.approveApplication('foreign', { action: 'APPROVE' }, hod)).rejects.toMatchObject({ statusCode: 404 });
    expect(tx.authedUser.findFirst).toHaveBeenCalledWith({ where: expect.objectContaining({
      uid: 'foreign', department_id: 'dept-a', college_id: 'college-a', requested_role: 'FACULTY',
      approval_status: { in: ['PENDING', 'pending'] }, role: { in: ['USER', 'PENDING_FACULTY'] },
    }) });
    expect(tx.authedUser.updateMany).not.toHaveBeenCalled();
  });

  it.each([['subjectId', 'subject'], ['classId', 'class']] as const)('rejects a foreign %s before updating', async (field, table) => {
    tx[table].findFirst.mockReset().mockResolvedValue(null);
    await expect(facultyService.approveApplication('applicant', { action: 'APPROVE', [field]: 'foreign' }, hod)).rejects.toMatchObject({ statusCode: 403 });
    expect(tx.authedUser.updateMany).not.toHaveBeenCalled();
  });

  it('denies approval if an existing subject or class assignment belongs to another department', async () => {
    tx.authedUser.findFirst.mockResolvedValue({ ...applicant, subject_id: 'foreign-subject' });
    tx.subject.findFirst.mockResolvedValue(null);
    await expect(facultyService.approveApplication('applicant', { action: 'APPROVE' }, hod)).rejects.toMatchObject({ statusCode: 403 });
    expect(tx.authedUser.updateMany).not.toHaveBeenCalled();
    tx.authedUser.findFirst.mockResolvedValue(applicant);
    tx.class.findFirst.mockReset().mockResolvedValue({ id: 'foreign-class' });
    await expect(facultyService.approveApplication('applicant', { action: 'APPROVE' }, hod)).rejects.toMatchObject({ statusCode: 403 });
    expect(tx.authedUser.updateMany).not.toHaveBeenCalled();
  });

  it('approves with guarded updates and only unassigns classes in the same department', async () => {
    tx.class.findFirst.mockResolvedValueOnce({ id: 'class-a' });
    await facultyService.approveApplication('applicant', { action: 'APPROVE', subjectId: 'subject-a', classId: 'class-a' }, hod);
    expect(tx.subject.findFirst).toHaveBeenCalledWith({ where: expect.objectContaining({ id: 'subject-a', department_id: 'dept-a' }) });
    expect(tx.class.findFirst).toHaveBeenCalledWith({ where: expect.objectContaining({ id: 'class-a', batch: expect.any(Object) }) });
    expect(tx.authedUser.updateMany).toHaveBeenCalledWith({ where: expect.objectContaining({ requested_role: 'FACULTY', department_id: 'dept-a', college_id: 'college-a' }), data: expect.objectContaining({ role: 'FACULTY', subject_id: 'subject-a' }) });
    expect(tx.class.updateMany).toHaveBeenCalledWith({ where: expect.objectContaining({ faculty_uid: 'applicant', batch: expect.any(Object) }), data: { faculty_uid: null } });
    expect(tx.class.updateMany).toHaveBeenCalledWith({ where: expect.objectContaining({ id: 'class-a', batch: expect.any(Object) }), data: { faculty_uid: 'applicant' } });
  });

  it('rejects foreign legacy identities and never reconciles by email or other role approvals', async () => {
    tx.user.findUnique.mockResolvedValue({ id: 'legacy', collegeId: 'college-b', status: 'PENDING' });
    await expect(facultyService.approveApplication('applicant', { action: 'REJECT' }, hod)).rejects.toMatchObject({ statusCode: 403 });
    expect(tx.authedUser.updateMany).not.toHaveBeenCalled();
    tx.user.findUnique.mockResolvedValue({ id: 'legacy', collegeId: 'college-a', status: 'PENDING' });
    await facultyService.approveApplication('applicant', { action: 'REJECT' }, hod);
    expect(tx.user.findUnique).toHaveBeenCalledWith({ where: { firebaseUid: 'applicant' } });
    expect(tx.accountApproval.updateMany).toHaveBeenCalledWith({ where: expect.objectContaining({ requestedRole: 'FACULTY', requestedCollege: 'college-a', status: 'PENDING' }), data: expect.objectContaining({ reviewedBy: 'hod-a', status: 'REJECTED' }) });
  });

  it('fails if the pending conditional update lost a race', async () => {
    tx.authedUser.updateMany.mockResolvedValue({ count: 0 });
    await expect(facultyService.approveApplication('applicant', { action: 'APPROVE' }, hod)).rejects.toMatchObject({ statusCode: 404 });
    expect(tx.class.updateMany).not.toHaveBeenCalled();
  });
});
