import prisma from '../config/database';

async function main() {
  const ft: any = await prisma.$queryRawUnsafe('SELECT * FROM faculty_timetables;');
  console.log('faculty_timetables rows count:', ft.length);
  console.log('faculty_timetables rows:', JSON.stringify(ft, null, 2));

  const ct: any = await prisma.$queryRawUnsafe('SELECT * FROM class_timetables;');
  console.log('class_timetables rows count:', ct.length);
  console.log('class_timetables rows:', JSON.stringify(ct, null, 2));

  const students: any = await prisma.$queryRawUnsafe(
    "SELECT uid, display_name, email, class_id FROM authed_users WHERE role = 'STUDENT';"
  );
  console.log('Students in DB:', JSON.stringify(students, null, 2));

  const classes: any = await prisma.$queryRawUnsafe("SELECT id, name, faculty_uid FROM classes;");
  console.log('Classes in DB:', JSON.stringify(classes, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
