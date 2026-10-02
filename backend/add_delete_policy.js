const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Add public DELETE policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Allow public delete authed_users" 
      ON public.authed_users 
      FOR DELETE 
      TO public 
      USING (true);
    `);
    console.log("Added DELETE policy to authed_users");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
