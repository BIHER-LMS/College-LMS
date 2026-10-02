const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe("ALTER TABLE public.authed_users ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'PENDING';");
    console.log('Added approval_status column successfully');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
