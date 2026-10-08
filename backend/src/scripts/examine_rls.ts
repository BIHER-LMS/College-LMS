import { prisma } from '../config/database';

async function examineRLS() {
  try {
    // Check if RLS is enabled on each table
    const tablesQuery = `
      SELECT
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const tables = await prisma.$queryRaw<any[]>`
      SELECT
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('=== TABLES AND RLS STATUS ===');
    for (const table of tables) {
      console.log(`${table.tablename}: RLS = ${table.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
    }

    // Check policies
    const policiesQuery = `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;

    const policies = await prisma.$queryRaw<any[]>`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;

    console.log('\n=== POLICIES ===');
    for (const policy of policies) {
      console.log(`${policy.tablename}.${policy.policyname} [${policy.cmd}] roles:${policy.roles} permissive:${policy.permissive}`);
      console.log(`  USING: ${policy.qual}`);
      console.log(`  WITH CHECK: ${policy.with_check}`);
      console.log('');
    }

    // Check grants - corrected query
    const grantsQuery = `
      SELECT
        grantee,
        table_name,
        privilege_type
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
      ORDER BY table_name, grantee;
    `;

    const grants = await prisma.$queryRaw<any[]>`
      SELECT
        grantee,
        table_name,
        privilege_type
      FROM information_schema.role_table_grants
      WHERE table_schema = 'public'
      ORDER BY table_name, grantee;
    `;

    console.log('\n=== GRANTS ===');
    for (const grant of grants) {
      console.log(`${grant.table_name}: ${grant.grantee} = ${grant.privilege_type}`);
    }

  } catch (error) {
    console.error('Error examining RLS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

examineRLS();