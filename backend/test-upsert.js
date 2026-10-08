const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const f = await prisma.authedUser.findFirst({where: {role: 'FACULTY'}});
  const c = await prisma.class.findFirst();
  const s = await prisma.subject.findFirst();
  console.log('Faculty:', f ? f.uid : 'none');
  console.log('Class:', c ? c.id : 'none');
  console.log('Subject:', s ? s.id : 'none');
  
  if (c && s && f) {
    const created = await prisma.classSubject.upsert({
      where: { class_id_subject_id: { class_id: c.id, subject_id: s.id } },
      update: { faculty_uid: f.uid },
      create: { class_id: c.id, subject_id: s.id, faculty_uid: f.uid }
    });
    console.log('Upserted ClassSubject:', created);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
