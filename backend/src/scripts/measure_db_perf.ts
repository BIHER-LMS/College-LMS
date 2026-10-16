import prisma from '../config/database';
import { StudentRepository } from '../modules/student/student.repository';
import { FacultyRepository } from '../modules/faculty/faculty.repository';
import { performance } from 'node:perf_hooks';

async function testPerf() {
  console.log('Testing Supabase DB + Repository Query Performance...');
  const studentRepo = new StudentRepository();
  const facultyRepo = new FacultyRepository();

  // Test 1: Academic Years
  const t0 = performance.now();
  const acadYearsCold = await studentRepo.getAcademicYears('00000000-0000-0000-0000-000000000000');
  const d0Cold = performance.now() - t0;

  const t1 = performance.now();
  const acadYearsWarm = await studentRepo.getAcademicYears('00000000-0000-0000-0000-000000000000');
  const d1Warm = performance.now() - t1;

  console.log(`Academic Years: Cold = ${d0Cold.toFixed(2)}ms, Warm = ${d1Warm.toFixed(3)}ms`);

  // Test 2: Faculty Reminders & Timetable (Batching test)
  const t2 = performance.now();
  const remindersCold = await facultyRepo.getTodayReminders('test-faculty-uid');
  const d2Cold = performance.now() - t2;

  const t3 = performance.now();
  const remindersWarm = await facultyRepo.getTodayReminders('test-faculty-uid');
  const d3Warm = performance.now() - t3;

  console.log(`Faculty Today Reminders: 1st Call = ${d2Cold.toFixed(2)}ms, 2nd Call = ${d3Warm.toFixed(2)}ms`);

  // Test 3: Attendance Summary (Parallel queries test)
  const t4 = performance.now();
  const attCold = await studentRepo.getStudentAttendanceSummary('test-student-uid');
  const d4Cold = performance.now() - t4;

  const t5 = performance.now();
  const attWarm = await studentRepo.getStudentAttendanceSummary('test-student-uid');
  const d5Warm = performance.now() - t5;

  console.log(`Student Attendance Summary: Cold = ${d4Cold.toFixed(2)}ms, Warm Cache = ${d5Warm.toFixed(3)}ms`);

  await prisma.$disconnect();
}

testPerf().catch(console.error);
