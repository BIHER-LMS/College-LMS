const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe(`SELECT * FROM pg_policies WHERE tablename = 'authed_users'`);
    console.log(res);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
