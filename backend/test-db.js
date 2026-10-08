const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const f = await prisma.classSubject.findMany({
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true } },
    }
  });
  console.dir(f, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
