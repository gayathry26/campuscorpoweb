const { commonPool } = require('../config/db');

async function setupSem5Student() {
  try {
    // Set Student 2 (Sneha) to Sem 5, Section A, CSE-A
    await commonPool.query(
      "UPDATE students_master SET current_semester = 5, class_name = 'CSE-A', section = 'A' WHERE id = 2"
    );

    // Move legacy placeholder courses to semesters 3 and 4 so Sem 5 has exactly 7 subjects
    await commonPool.query("UPDATE lms_courses SET semester = 3 WHERE course_code IN ('FS-301', 'DS-202')");
    await commonPool.query("UPDATE lms_courses SET semester = 4 WHERE course_code IN ('CLD-401', 'PLC-101')");

    // Delete any non-Sem 5 courses from Student 2 enrollments
    await commonPool.query('DELETE FROM lms_course_enrollments WHERE student_id = 2');

    // Enroll into all Semester 5 CSE courses (CS501 - CS507)
    const [sem5Courses] = await commonPool.query(
      "SELECT id, course_code, title FROM lms_courses WHERE department_code = 'CSE' AND semester = 5"
    );

    for (const c of sem5Courses) {
      await commonPool.query(
        `INSERT INTO lms_course_enrollments (course_id, student_id, enrolled_at, status, progress_percentage)
         VALUES (?, 2, NOW(), 'ENROLLED', 45.0)
         ON DUPLICATE KEY UPDATE status = 'ENROLLED'`,
        [c.id]
      );
      console.log(`Enrolled Student 2 in ${c.course_code}: ${c.title}`);
    }

    console.log(`\nSuccessfully mapped Student 2 to ${sem5Courses.length} Semester 5 courses.`);
    process.exit(0);
  } catch (err) {
    console.error('Error setting up Sem 5 student:', err);
    process.exit(1);
  }
}

setupSem5Student();
