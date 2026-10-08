import { prisma } from '../modules/hod_temp/config/db';

export async function initFacultyTables() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS faculty_timetables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      faculty_uid VARCHAR(255) NOT NULL,
      day_of_week VARCHAR(50) NOT NULL,
      period VARCHAR(50) NOT NULL,
      start_time VARCHAR(50),
      end_time VARCHAR(50),
      class_id UUID,
      class_name VARCHAR(255) NOT NULL,
      subject_id UUID,
      subject_name VARCHAR(255) NOT NULL,
      room VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_faculty_timetables_uid ON faculty_timetables(faculty_uid);`,
    `CREATE TABLE IF NOT EXISTS faculty_reminders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      faculty_uid VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
      class_id UUID,
      class_name VARCHAR(255),
      subject_name VARCHAR(255),
      due_date DATE NOT NULL DEFAULT CURRENT_DATE,
      due_time VARCHAR(50),
      priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_faculty_reminders_uid ON faculty_reminders(faculty_uid);`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log('faculty_timetables and faculty_reminders initialized successfully');
}

if (require.main === module || process.argv[1]?.includes('init_faculty_tables')) {
  initFacultyTables()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
