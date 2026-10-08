const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'amuchi0806@gmail.com';
    await prisma.$executeRaw`UPDATE authed_users SET approval_status = 'APPROVED' WHERE email = ${email}`;
    console.log("Updated approval_status to APPROVED");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
