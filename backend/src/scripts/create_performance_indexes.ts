import prisma from '../config/database';

export async function createPerformanceIndexes() {
  console.log('Creating optimized B-tree indexes on Supabase PostgreSQL...');

  const indexStatements = [
    `CREATE INDEX IF NOT EXISTS idx_authed_users_class_role ON authed_users(class_id, role);`,
    `CREATE INDEX IF NOT EXISTS idx_authed_users_dept ON authed_users(department_id);`,
    `CREATE INDEX IF NOT EXISTS idx_authed_users_college ON authed_users(college_id);`,
    `CREATE INDEX IF NOT EXISTS idx_authed_users_lower_email ON authed_users(LOWER(email));`,
    `CREATE INDEX IF NOT EXISTS idx_classes_faculty_uid ON classes(faculty_uid);`,
    `CREATE INDEX IF NOT EXISTS idx_subjects_dept ON subjects(department_id);`,
    `CREATE INDEX IF NOT EXISTS idx_faculty_timetables_class_id ON faculty_timetables(class_id);`,
    `CREATE INDEX IF NOT EXISTS idx_class_timetables_class_day ON class_timetables(class_id, day_of_week);`,
  ];

  for (const sql of indexStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`Executed: ${sql}`);
    } catch (err) {
      console.error(`Failed index statement: ${sql}`, err);
    }
  }

  // Verify created indexes
  const created = await prisma.$queryRaw<Array<{ indexname: string; tablename: string }>>`
    SELECT indexname, tablename 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname IN (
        'idx_authed_users_class_role',
        'idx_authed_users_dept',
        'idx_authed_users_college',
        'idx_authed_users_lower_email',
        'idx_classes_faculty_uid',
        'idx_subjects_dept',
        'idx_faculty_timetables_class_id',
        'idx_class_timetables_class_day'
      );
  `;
  console.log('Verified active performance indexes:', created);
}

if (require.main === module || process.argv[1]?.includes('create_performance_indexes')) {
  createPerformanceIndexes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
