const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_COMMON_NAME || 'lms',
};

async function runEnhancements() {
  console.log('================================================================');
  console.log('🚀 [MIGRATION] LMS Schema Enhancements & Comprehensive Data Seed');
  console.log('================================================================');

  const conn = await mysql.createConnection(dbConfig);
  try {
    // 1. Create lms_live_attendance table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_live_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        live_class_id INT NOT NULL,
        student_id INT NOT NULL,
        status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') DEFAULT 'PRESENT',
        marked_by INT NOT NULL,
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes VARCHAR(255) NULL,
        UNIQUE KEY uq_live_student (live_class_id, student_id),
        INDEX idx_la_student (student_id),
        INDEX idx_la_class (live_class_id),
        FOREIGN KEY (live_class_id) REFERENCES lms_live_classes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_live_attendance');

    // 2. Add columns helper
    const addColumnIfNotExists = async (table, column, definition) => {
      const [rows] = await conn.query(
        'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [dbConfig.database, table, column]
      );
      if (rows.length === 0) {
        await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`✓ Added column ${table}.${column}`);
      }
    };

    await addColumnIfNotExists('lms_assignment_submissions', 'is_late', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('lms_assignments', 'start_date', 'DATETIME NULL');
    await addColumnIfNotExists('lms_assignments', 'allow_late_submissions', 'BOOLEAN DEFAULT TRUE');
    await addColumnIfNotExists('lms_assignments', 'allow_resubmissions', 'BOOLEAN DEFAULT TRUE');
    await addColumnIfNotExists('lms_quizzes', 'start_date', 'DATETIME NULL');
    await addColumnIfNotExists('lms_quizzes', 'results_released', 'BOOLEAN DEFAULT TRUE');
    await addColumnIfNotExists('lms_quiz_attempts', 'evaluation_status', "ENUM('AUTO_GRADED', 'AWAITING_REVIEW', 'GRADED', 'RESULTS_RELEASED') DEFAULT 'AUTO_GRADED'");
    await addColumnIfNotExists('lms_course_resources', 'is_published', 'BOOLEAN DEFAULT TRUE');
    await addColumnIfNotExists('lms_course_resources', 'description', 'TEXT NULL');
    await addColumnIfNotExists('lms_course_resources', 'target_section', "VARCHAR(50) DEFAULT 'ALL'");

    // Modify status ENUM on lms_assignment_submissions to support full lifecycle
    try {
      await conn.query(`
        ALTER TABLE lms_assignment_submissions 
        MODIFY COLUMN status ENUM('SUBMITTED', 'AWAITING_GRADING', 'GRADED', 'RESULTS_RELEASED', 'RESUBMISSION_REQUESTED') DEFAULT 'SUBMITTED'
      `);
      console.log('✓ Updated lms_assignment_submissions status enum');
    } catch (e) {
      console.log('Status enum already updated or not modified:', e.message);
    }

    // 3. Seed additional students to test assignment/unassigned courses
    // Student 1 (Aditya Varma, user 8, CSE)
    // Student 2 (Rahul Sharma, user 9, CSE)
    // Student 3 (Priya Nair, user 10, ECE)
    // Enroll Student 2 in Course 1 & 4
    await conn.query(`
      INSERT IGNORE INTO lms_course_enrollments (course_id, student_id, status, progress_percentage)
      VALUES (1, 2, 'IN_PROGRESS', 40.00), (4, 2, 'IN_PROGRESS', 50.00)
    `);

    // Ensure Student 3 (ECE) is ONLY enrolled in Course 4 (Placement Readiness), NOT Course 1 (CSE Full Stack)
    // So Course 1 is an unassigned course for Student 3!
    await conn.query(`
      INSERT IGNORE INTO lms_course_enrollments (course_id, student_id, status, progress_percentage)
      VALUES (4, 3, 'IN_PROGRESS', 20.00)
    `);

    // 4. Seed a pending assignment submission from Student 2 for faculty grading queue testing
    await conn.query(`
      INSERT IGNORE INTO lms_assignment_submissions (
        assignment_id, student_id, submission_text, github_url, file_name, file_url, status, submitted_at
      ) VALUES (
        1, 2,
        'Implemented full microservice API with Docker Compose, JWT authentication middleware, and Redis caching. Tested endpoints using Postman.',
        'https://github.com/rahulsharma-cse/microservices-demo',
        'microservices-project-rahul.zip',
        '/uploads/lms/assignments/sample-microservice.zip',
        'SUBMITTED',
        NOW()
      )
    `);

    // 5. Seed live class attendance records for testing
    const [liveClasses] = await conn.query('SELECT id FROM lms_live_classes LIMIT 2');
    if (liveClasses.length > 0) {
      const classId1 = liveClasses[0].id;
      await conn.query(`
        INSERT IGNORE INTO lms_live_attendance (live_class_id, student_id, status, marked_by, notes)
        VALUES 
          (?, 1, 'PRESENT', 4, 'Attended full 60 min session, participated in Q&A'),
          (?, 2, 'PRESENT', 4, 'Attended full session')
      `, [classId1, classId1]);

      if (liveClasses.length > 1) {
        const classId2 = liveClasses[1].id;
        await conn.query(`
          INSERT IGNORE INTO lms_live_attendance (live_class_id, student_id, status, marked_by, notes)
          VALUES 
            (?, 1, 'PRESENT', 4, 'Interactive code review session'),
            (?, 2, 'LATE', 4, 'Joined 15 mins late')
        `, [classId2, classId2]);
      }
    }

    console.log('✓ Seeded enrollments, pending submissions, and live attendance.');
    console.log('✅ LMS Schema Enhancement Migration completed successfully!');
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  runEnhancements().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { runEnhancements };
