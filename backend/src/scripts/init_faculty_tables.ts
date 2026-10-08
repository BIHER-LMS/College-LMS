import { prisma } from '../modules/hod_temp/config/db';

export async function initFacultyTables() {
  const statements = [
    `DO $$ BEGIN
      CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,
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
    `CREATE TABLE IF NOT EXISTS class_timetables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL,
      day_of_week VARCHAR(50) NOT NULL,
      period VARCHAR(50) NOT NULL,
      start_time VARCHAR(50),
      end_time VARCHAR(50),
      subject_name VARCHAR(255) NOT NULL,
      subject_code VARCHAR(100),
      faculty_name VARCHAR(255),
      room VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_class_timetables_class_id ON class_timetables(class_id);`,
    `CREATE TABLE IF NOT EXISTS attendance_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL,
      faculty_uid VARCHAR(255) NOT NULL,
      subject_id UUID,
      date DATE NOT NULL,
      period VARCHAR(50) NOT NULL,
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_attendance_sessions_class_date_period UNIQUE (class_id, date, period)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class_date ON attendance_sessions(class_id, date);`,
    `CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty ON attendance_sessions(faculty_uid);`,
    `CREATE TABLE IF NOT EXISTS attendance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      attendance_session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      student_uid VARCHAR(255) NOT NULL,
      status "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_attendance_records_session_student UNIQUE (attendance_session_id, student_uid)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_uid);`,
    `CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(attendance_session_id);`,
    `ALTER TABLE public.class_timetables ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.faculty_reminders ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.faculty_timetables ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log('faculty_timetables, faculty_reminders, class_timetables, attendance_sessions, and attendance_records initialized successfully');
}

if (require.main === module || process.argv[1]?.includes('init_faculty_tables')) {
  initFacultyTables()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
