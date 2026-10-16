import prisma from '../config/database';

export async function initLeavesTable() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS student_leaves (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      college_id VARCHAR(255) NOT NULL,
      class_id UUID NOT NULL,
      student_uid VARCHAR(255) NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      register_number VARCHAR(100),
      reason_category VARCHAR(50) NOT NULL,
      explanation TEXT NOT NULL,
      from_date DATE NOT NULL,
      to_date DATE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      reviewed_by_uid VARCHAR(255),
      reviewed_by_name VARCHAR(255),
      review_remarks TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `CREATE INDEX IF NOT EXISTS idx_student_leaves_student ON student_leaves(student_uid);`,
    `CREATE INDEX IF NOT EXISTS idx_student_leaves_class ON student_leaves(class_id);`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
  console.log('✅ student_leaves table and indexes successfully ensured in database.');
  await prisma.$disconnect();
}

initLeavesTable().catch(console.error);
