import prisma from '../config/database';

async function testQuery() {
  const classId = '3f576135-669c-4e18-8176-0c57158da1f4';
  const query = `
    SELECT * FROM (
      SELECT 
        ct.id, 
        ct.class_id, 
        ct.day_of_week, 
        ct.period, 
        ct.start_time, 
        ct.end_time, 
        ct.subject_name, 
        ct.subject_code, 
        ct.faculty_name, 
        ct.room
      FROM class_timetables ct
      WHERE ct.class_id = $1::uuid
      UNION ALL
      SELECT 
        ft.id, 
        ft.class_id, 
        ft.day_of_week, 
        ft.period, 
        ft.start_time, 
        ft.end_time, 
        ft.subject_name, 
        COALESCE(s.code, '') AS subject_code, 
        COALESCE(u.display_name, u.email, 'Faculty Member') AS faculty_name, 
        ft.room
      FROM faculty_timetables ft
      LEFT JOIN authed_users u ON u.uid = ft.faculty_uid
      LEFT JOIN subjects s ON s.id = ft.subject_id
      WHERE ft.class_id = $1::uuid
        AND NOT EXISTS (
          SELECT 1 FROM class_timetables ct2 
          WHERE ct2.class_id = ft.class_id 
            AND LOWER(TRIM(ct2.day_of_week)) = LOWER(TRIM(ft.day_of_week))
            AND LOWER(TRIM(ct2.period)) = LOWER(TRIM(ft.period))
        )
    ) unified
    ORDER BY 
      CASE LOWER(TRIM(day_of_week))
        WHEN 'monday' THEN 1
        WHEN 'tuesday' THEN 2
        WHEN 'wednesday' THEN 3
        WHEN 'thursday' THEN 4
        WHEN 'friday' THEN 5
        WHEN 'saturday' THEN 6
        WHEN 'sunday' THEN 7
        ELSE 8
      END,
      period ASC, start_time ASC;
  `;

  const rows: any = await prisma.$queryRawUnsafe(query, classId);
  console.log('Result count:', rows.length);
  console.log('Returned slots:', JSON.stringify(rows, null, 2));
}

testQuery().catch(console.error).finally(() => process.exit(0));
