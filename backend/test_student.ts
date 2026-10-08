import { studentService } from './src/modules/student/student.service';
import prisma from './src/config/database';

async function main() {
  const dbUser = await prisma.authedUser.findFirst({ where: { role: 'STUDENT' } });
  if (!dbUser) { console.log('No student found'); return; }
  const studentContext = {
    uid: dbUser.uid,
    classId: dbUser.class_id,
    departmentId: dbUser.department_id,
    collegeId: dbUser.college_id
  } as any;
  console.log('Context:', studentContext);
  const tt = await studentService.getClassTimetable(studentContext);
  console.log('Timetable from service:', tt);
}

main().finally(() => prisma.$disconnect());
