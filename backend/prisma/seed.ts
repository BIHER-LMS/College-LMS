import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script — populates roles, permissions, and a demo college.
 *
 * Idempotent: uses upsert so it can be run multiple times safely.
 */
async function main() {
  console.log('🌱 Seeding database...');

  // ── Roles ───────────────────────────────────────────
  const roles: Array<{ name: RoleName; displayName: string; description: string }> = [
    { name: 'STUDENT', displayName: 'Student', description: 'Enrolled student' },
    { name: 'FACULTY', displayName: 'Faculty', description: 'Teaching faculty member' },
    { name: 'TRAINER', displayName: 'Trainer', description: 'External or internal trainer' },
    { name: 'HOD', displayName: 'Head of Department', description: 'Head of a department' },
    { name: 'TPO', displayName: 'Training & Placement Officer', description: 'Manages placements and training' },
    { name: 'COLLEGE_ADMIN', displayName: 'College Administrator', description: 'Administrates a single college' },
    { name: 'SUPERINTENDENT', displayName: 'Superintendent', description: 'Oversees college operations' },
    { name: 'SUPER_ADMIN', displayName: 'Platform Admin', description: 'Platform-wide super administrator' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, description: role.description },
      create: role,
    });
  }
  console.log(`  ✅ ${roles.length} roles upserted`);

  // ── Permissions ─────────────────────────────────────
  const permissions = [
    // Users module
    { name: 'users:read', displayName: 'View Users', module: 'users', description: 'View user list and details' },
    { name: 'users:write', displayName: 'Manage Users', module: 'users', description: 'Create and update users' },
    { name: 'users:delete', displayName: 'Delete Users', module: 'users', description: 'Delete user accounts' },
    // Approvals module
    { name: 'approvals:read', displayName: 'View Approvals', module: 'approvals', description: 'View pending approvals' },
    { name: 'approvals:manage', displayName: 'Manage Approvals', module: 'approvals', description: 'Approve or reject accounts' },
    // Profiles module
    { name: 'profiles:read', displayName: 'View Profiles', module: 'profiles', description: 'View user profiles' },
    { name: 'profiles:write', displayName: 'Edit Own Profile', module: 'profiles', description: 'Edit own profile' },
    { name: 'profiles:manage', displayName: 'Manage Profiles', module: 'profiles', description: 'Edit any profile in tenant' },
    // Colleges module
    { name: 'colleges:read', displayName: 'View Colleges', module: 'colleges', description: 'View college list' },
    { name: 'colleges:write', displayName: 'Manage Colleges', module: 'colleges', description: 'Create and update colleges' },
    { name: 'colleges:delete', displayName: 'Delete Colleges', module: 'colleges', description: 'Delete colleges' },
    // Roles module
    { name: 'roles:read', displayName: 'View Roles', module: 'roles', description: 'View role list' },
    { name: 'roles:manage', displayName: 'Manage Roles', module: 'roles', description: 'Assign and remove roles' },
    // Sessions module
    { name: 'sessions:read', displayName: 'View Sessions', module: 'sessions', description: 'View own sessions' },
    { name: 'sessions:manage', displayName: 'Manage Sessions', module: 'sessions', description: 'Revoke sessions' },
    // Audit module
    { name: 'audit:read', displayName: 'View Audit Logs', module: 'audit', description: 'Read audit trail' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { displayName: perm.displayName, module: perm.module, description: perm.description },
      create: perm,
    });
  }
  console.log(`  ✅ ${permissions.length} permissions upserted`);

  // ── Role ↔ Permission assignments ───────────────────
  const rolePermissions: Record<RoleName, string[]> = {
    STUDENT: [
      'profiles:read', 'profiles:write', 'sessions:read', 'sessions:manage',
    ],
    FACULTY: [
      'users:read', 'profiles:read', 'profiles:write', 'sessions:read', 'sessions:manage',
    ],
    TRAINER: [
      'profiles:read', 'profiles:write', 'sessions:read', 'sessions:manage',
    ],
    HOD: [
      'users:read', 'approvals:read', 'approvals:manage',
      'profiles:read', 'profiles:write', 'profiles:manage',
      'roles:read', 'sessions:read', 'sessions:manage', 'audit:read',
    ],
    TPO: [
      'users:read', 'profiles:read', 'profiles:write',
      'sessions:read', 'sessions:manage',
    ],
    COLLEGE_ADMIN: [
      'users:read', 'users:write', 'approvals:read', 'approvals:manage',
      'profiles:read', 'profiles:write', 'profiles:manage',
      'colleges:read', 'roles:read', 'roles:manage',
      'sessions:read', 'sessions:manage', 'audit:read',
    ],
    SUPERINTENDENT: [
      'users:read', 'users:write', 'approvals:read', 'approvals:manage',
      'profiles:read', 'profiles:write', 'profiles:manage',
      'colleges:read', 'roles:read', 'roles:manage',
      'sessions:read', 'sessions:manage', 'audit:read',
    ],
    SUPER_ADMIN: [
      // All permissions
      'users:read', 'users:write', 'users:delete',
      'approvals:read', 'approvals:manage',
      'profiles:read', 'profiles:write', 'profiles:manage',
      'colleges:read', 'colleges:write', 'colleges:delete',
      'roles:read', 'roles:manage',
      'sessions:read', 'sessions:manage',
      'audit:read',
    ],
  };

  for (const [roleName, permNames] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName as RoleName } });
    if (!role) continue;

    for (const permName of permNames) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
  console.log('  ✅ Role-permission mappings set');

  // ── Demo College ────────────────────────────────────
  await prisma.college.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      name: 'Demo College of Engineering',
      code: 'DEMO',
      domain: 'demo.edu',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
    },
  });
  console.log('  ✅ Demo college created');

  console.log('🌱 Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
