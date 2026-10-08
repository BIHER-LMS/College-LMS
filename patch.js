const fs = require('fs');
const file = 'backend/src/modules/faculty/faculty.repository.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /const idsToAdd = \(timetableClassRows \|\| \[\]\)/,
  `const subjectClassRows: any = await prisma.$queryRawUnsafe(
            'SELECT DISTINCT class_id FROM class_subjects WHERE faculty_uid = \\$1;',
            facultyUid
          ).catch(() => []);

          const idsToAdd = [...(timetableClassRows || []), ...(subjectClassRows || [])]`
);
fs.writeFileSync(file, content);
console.log('Done');
