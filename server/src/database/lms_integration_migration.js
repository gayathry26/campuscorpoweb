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

async function runLmsIntegrationMigration() {
  console.log('================================================================');
  console.log('🚀 [MIGRATION] Setting up CampusCorp Role-Based LMS Tables & Data...');
  console.log('================================================================');

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // 1. Courses Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        department_code VARCHAR(20) DEFAULT NULL,
        instructor_id INT NOT NULL,
        thumbnail_url VARCHAR(255),
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'PUBLISHED',
        level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
        duration_hours INT DEFAULT 20,
        passing_percentage INT DEFAULT 60,
        certificate_enabled BOOLEAN DEFAULT TRUE,
        linked_skill_id VARCHAR(64) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_course_dept (department_code),
        INDEX idx_course_instructor (instructor_id),
        INDEX idx_course_status (status)
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_courses');

    // 2. Course Enrollments Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_course_enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        student_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED') DEFAULT 'IN_PROGRESS',
        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
        completed_at TIMESTAMP NULL DEFAULT NULL,
        certificate_issued BOOLEAN DEFAULT FALSE,
        certificate_id VARCHAR(64) NULL DEFAULT NULL,
        UNIQUE KEY uq_course_student (course_id, student_id),
        INDEX idx_enr_student (student_id),
        INDEX idx_enr_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_course_enrollments');

    // 3. Course Modules Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        order_index INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_mod_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_modules');

    // 4. Lessons Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        module_id INT NOT NULL,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT,
        lesson_type ENUM('VIDEO', 'PDF', 'DOCUMENT', 'INTERACTIVE', 'LINK') DEFAULT 'DOCUMENT',
        resource_url VARCHAR(500),
        duration_minutes INT DEFAULT 15,
        order_index INT DEFAULT 1,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_les_mod (module_id),
        INDEX idx_les_course (course_id),
        FOREIGN KEY (module_id) REFERENCES lms_modules(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_lessons');

    // 5. Lesson Progress Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        course_id INT NOT NULL,
        student_id INT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL DEFAULT NULL,
        last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_lesson_student (lesson_id, student_id),
        INDEX idx_les_prog_student (student_id),
        FOREIGN KEY (lesson_id) REFERENCES lms_lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_lesson_progress');

    // 6. Course Resources (PDFs, PPTs, Notes)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_course_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        module_id INT NULL,
        title VARCHAR(200) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_size_kb INT DEFAULT 0,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_res_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_course_resources');

    // 7. Quizzes
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        instructions TEXT,
        time_limit_minutes INT DEFAULT 30,
        max_attempts INT DEFAULT 3,
        passing_score INT DEFAULT 60,
        due_date DATETIME NULL,
        is_published BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_quiz_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_quizzes');

    // 8. Quiz Questions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_type ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER') DEFAULT 'MCQ',
        options JSON,
        correct_answer VARCHAR(255) NOT NULL,
        marks INT DEFAULT 1,
        explanation TEXT,
        order_index INT DEFAULT 1,
        INDEX idx_qq_quiz (quiz_id),
        FOREIGN KEY (quiz_id) REFERENCES lms_quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_quiz_questions');

    // 9. Quiz Attempts
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        student_id INT NOT NULL,
        attempt_number INT DEFAULT 1,
        score DECIMAL(5,2) DEFAULT 0.00,
        max_score DECIMAL(5,2) DEFAULT 0.00,
        percentage DECIMAL(5,2) DEFAULT 0.00,
        passed BOOLEAN DEFAULT FALSE,
        answers JSON,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_qa_quiz_student (quiz_id, student_id),
        FOREIGN KEY (quiz_id) REFERENCES lms_quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_quiz_attempts');

    // 10. Assignments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT,
        max_marks INT DEFAULT 100,
        due_date DATETIME NOT NULL,
        allowed_file_types VARCHAR(100) DEFAULT 'pdf,zip,doc,docx,py,js,java,cpp',
        is_published BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_assign_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_assignments');

    // 11. Assignment Submissions
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_assignment_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        submission_text TEXT,
        file_url VARCHAR(500),
        file_name VARCHAR(255),
        github_url VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('SUBMITTED', 'GRADED', 'RESUBMISSION_REQUESTED') DEFAULT 'SUBMITTED',
        grade DECIMAL(5,2) NULL,
        feedback TEXT NULL,
        graded_by INT NULL,
        graded_at DATETIME NULL,
        UNIQUE KEY uq_assign_student (assignment_id, student_id),
        INDEX idx_as_student (student_id),
        FOREIGN KEY (assignment_id) REFERENCES lms_assignments(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_assignment_submissions');

    // 12. Learning Paths
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        target_role_id VARCHAR(64) NULL,
        department_code VARCHAR(20) NULL,
        estimated_weeks INT DEFAULT 8,
        course_ids JSON,
        milestones JSON,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_learning_paths');

    // 13. Learning Path Enrollments
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_learning_path_enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        student_id INT NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
        completed_milestones JSON,
        status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_path_student (path_id, student_id),
        FOREIGN KEY (path_id) REFERENCES lms_learning_paths(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_learning_path_enrollments');

    // 14. Live Classes & Calendar
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_live_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        instructor_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        duration_minutes INT DEFAULT 60,
        meeting_link VARCHAR(500) NOT NULL,
        platform VARCHAR(50) DEFAULT 'CampusCorp Video / WebRTC Meet',
        status ENUM('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
        recording_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_live_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_live_classes');

    // 15. Discussions & Doubts
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_discussions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_disc_course (course_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_discussions');

    // 16. Discussion Replies
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_discussion_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        discussion_id INT NOT NULL,
        user_id INT NOT NULL,
        reply_text TEXT NOT NULL,
        is_faculty_answer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rep_disc (discussion_id),
        FOREIGN KEY (discussion_id) REFERENCES lms_discussions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_discussion_replies');

    // 17. Student Notes & Bookmarks
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_student_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        lesson_id INT NULL,
        title VARCHAR(200) NOT NULL,
        note_content TEXT NOT NULL,
        is_bookmarked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_notes_student (student_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_student_notes');

    // 18. Certificates
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_certificates (
        id VARCHAR(64) PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        issue_date DATE NOT NULL,
        grade_achieved VARCHAR(10) DEFAULT 'A+',
        certificate_url VARCHAR(500) NULL,
        verification_hash VARCHAR(128) NOT NULL,
        is_approved BOOLEAN DEFAULT TRUE,
        approved_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_cert_student (student_id),
        FOREIGN KEY (course_id) REFERENCES lms_courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_certificates');

    // 19. LMS Notifications
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('COURSE_UPDATE', 'ASSIGNMENT_DUE', 'QUIZ_RELEASED', 'GRADE_POSTED', 'LIVE_CLASS', 'ANNOUNCEMENT', 'BADGE_EARNED') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        link_url VARCHAR(255) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_user (user_id)
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_notifications');

    // 20. Student Portfolio Projects
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_student_portfolio_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        technologies JSON,
        github_url VARCHAR(255) NULL,
        live_demo_url VARCHAR(255) NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        faculty_approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_port_student (student_id)
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_student_portfolio_projects');

    // 21. Support Tickets
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NULL,
        category ENUM('COURSE_ACCESS', 'VIDEO_PLAYBACK', 'QUIZ_SUBMISSION', 'ASSIGNMENT_UPLOAD', 'CERTIFICATE', 'OTHER') DEFAULT 'OTHER',
        subject VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
        resolution_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ticket_student (student_id)
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_support_tickets');

    // 22. Course Announcements
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NULL,
        department_code VARCHAR(20) NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        author_id INT NOT NULL,
        priority ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ann_course (course_id)
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table lms_announcements');

    // ==========================================
    // SEED INITIAL REALISTIC COURSES & CONTENT
    // ==========================================
    console.log('\n🌱 Seeding initial courses, modules, lessons, quizzes and materials...');

    // Instructor: Prof. Suresh Venkatesh (id: 4, CSE)
    const instructorId = 4;
    // Demo student: Aditya Varma (id: 8, or students_master id 1)
    const [students] = await conn.query('SELECT id, user_id, register_number FROM students_master LIMIT 5');
    const demoStudentId = students.length > 0 ? students[0].id : 1;
    const demoUserId = students.length > 0 ? (students[0].user_id || 8) : 8;

    const sampleCourses = [
      {
        course_code: 'FS-301',
        title: 'Full Stack Web Engineering & Microservices',
        description: 'Comprehensive enterprise-grade full stack development covering React 19, Node.js, Express, PostgreSQL, Docker containerization, REST API security, and CI/CD pipelines.',
        category: 'Software Development',
        department_code: 'CSE',
        thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
        level: 'INTERMEDIATE',
        duration_hours: 48,
        linked_skill_id: 'react',
        status: 'PUBLISHED',
      },
      {
        course_code: 'DS-202',
        title: 'Data Science & Applied Machine Learning',
        description: 'Hands-on practical data science utilizing Python, Pandas, Scikit-learn, exploratory data analytics, neural networks, and business intelligence dashboards with Power BI.',
        category: 'Data Science & AI',
        department_code: 'CSE',
        thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        level: 'INTERMEDIATE',
        duration_hours: 40,
        linked_skill_id: 'python',
        status: 'PUBLISHED',
      },
      {
        course_code: 'CLD-401',
        title: 'Cloud Architecture & DevOps Engineering (AWS & K8s)',
        description: 'Infrastructure as code with Terraform, container orchestration with Kubernetes, AWS VPC architectures, Docker Swarm, and automated GitHub Actions delivery.',
        category: 'Cloud Computing & DevOps',
        department_code: 'CSE',
        thumbnail_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
        level: 'ADVANCED',
        duration_hours: 36,
        linked_skill_id: 'docker',
        status: 'PUBLISHED',
      },
      {
        course_code: 'PLC-101',
        title: 'Technical Interview Mastery & Placement Readiness',
        description: 'Master Data Structures and Algorithms (LeetCode patterns), mock technical interviews, system design fundamentals, resume ATS optimization, and HR behavioral rounds.',
        category: 'Placement Preparation',
        department_code: null, // Institute-wide
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        level: 'BEGINNER',
        duration_hours: 30,
        linked_skill_id: 'problem-solving',
        status: 'PUBLISHED',
      },
    ];

    for (const c of sampleCourses) {
      await conn.query(
        `INSERT INTO lms_courses (
          course_code, title, description, category, department_code,
          instructor_id, thumbnail_url, level, duration_hours,
          linked_skill_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          category = VALUES(category),
          status = VALUES(status),
          thumbnail_url = VALUES(thumbnail_url)`,
        [
          c.course_code, c.title, c.description, c.category, c.department_code,
          instructorId, c.thumbnail_url, c.level, c.duration_hours,
          c.linked_skill_id, c.status
        ]
      );
    }
    console.log('✓ Seeded 4 master courses.');

    // Fetch course IDs
    const [courseRows] = await conn.query('SELECT id, course_code FROM lms_courses');
    const courseMap = {};
    courseRows.forEach(r => { courseMap[r.course_code] = r.id; });

    const fsCourseId = courseMap['FS-301'];
    const dsCourseId = courseMap['DS-202'];
    const plCourseId = courseMap['PLC-101'];

    // Enroll demo student in FS-301 and PLC-101
    if (fsCourseId && demoStudentId) {
      await conn.query(
        `INSERT INTO lms_course_enrollments (course_id, student_id, status, progress_percentage)
         VALUES (?, ?, 'IN_PROGRESS', 65.00)
         ON DUPLICATE KEY UPDATE status = 'IN_PROGRESS'`,
        [fsCourseId, demoStudentId]
      );
    }
    if (plCourseId && demoStudentId) {
      await conn.query(
        `INSERT INTO lms_course_enrollments (course_id, student_id, status, progress_percentage, certificate_issued, certificate_id)
         VALUES (?, ?, 'COMPLETED', 100.00, 1, 'CERT-PLC-2026-9042')
         ON DUPLICATE KEY UPDATE status = 'COMPLETED'`,
        [plCourseId, demoStudentId]
      );
    }
    if (dsCourseId && demoStudentId) {
      await conn.query(
        `INSERT INTO lms_course_enrollments (course_id, student_id, status, progress_percentage)
         VALUES (?, ?, 'IN_PROGRESS', 25.00)
         ON DUPLICATE KEY UPDATE status = 'IN_PROGRESS'`,
        [dsCourseId, demoStudentId]
      );
    }
    console.log('✓ Seeded student course enrollments.');

    // Seed Modules and Lessons for FS-301
    if (fsCourseId) {
      const [existingMods] = await conn.query('SELECT id FROM lms_modules WHERE course_id = ?', [fsCourseId]);
      if (existingMods.length === 0) {
        // Module 1
        const [m1] = await conn.query(
          `INSERT INTO lms_modules (course_id, title, description, order_index)
           VALUES (?, 'Module 1: Modern React 19 Architectures & State', 'Component trees, hooks, custom primitives, and state containers.', 1)`,
          [fsCourseId]
        );
        const mod1Id = m1.insertId;

        // Lessons for Module 1
        await conn.query(
          `INSERT INTO lms_lessons (module_id, course_id, title, content, lesson_type, resource_url, duration_minutes, order_index)
           VALUES 
           (?, ?, '1.1 Deep Dive: Virtual DOM and React 19 Actions', 'Architectural breakdown of React 19 compilers, server components, and useActionState.', 'DOCUMENT', 'https://react.dev', 20, 1),
           (?, ?, '1.2 Advanced Hooks: Custom Hooks & Performance Profiling', 'Learn useMemo, useCallback, useRef lifecycle patterns and React DevTools Profiler.', 'VIDEO', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 35, 2),
           (?, ?, '1.3 Global State: Zustand vs Redux Toolkit', 'Comparison of modern lightweight state management paradigms with optimistic mutations.', 'DOCUMENT', 'https://docs.pmnd.rs/zustand', 25, 3)`,
          [mod1Id, fsCourseId, mod1Id, fsCourseId, mod1Id, fsCourseId]
        );

        // Module 2
        const [m2] = await conn.query(
          `INSERT INTO lms_modules (course_id, title, description, order_index)
           VALUES (?, 'Module 2: High-Performance Express & Microservices API', 'RESTful API best practices, middleware chaining, rate limiting, and JWT auth.', 2)`,
          [fsCourseId]
        );
        const mod2Id = m2.insertId;

        await conn.query(
          `INSERT INTO lms_lessons (module_id, course_id, title, content, lesson_type, resource_url, duration_minutes, order_index)
           VALUES 
           (?, ?, '2.1 Express Route Architecture & Error Middleware', 'Building robust MVC backends with global error handlers and async route wrappers.', 'DOCUMENT', 'https://expressjs.com', 30, 1),
           (?, ?, '2.2 Secure JWT Authentication & Refresh Tokens', 'Implementing cryptographically signed HTTP-only cookies and role permissions gates.', 'VIDEO', 'https://jwt.io/introduction', 40, 2),
           (?, ?, '2.3 Relational SQL Schema Design with MySQL & Transactions', 'ACID transactions, foreign key constraints, connection pooling, and rippling migrations.', 'DOCUMENT', 'https://dev.mysql.com/doc/', 35, 3)`,
          [mod2Id, fsCourseId, mod2Id, fsCourseId, mod2Id, fsCourseId]
        );

        // Module 3
        const [m3] = await conn.query(
          `INSERT INTO lms_modules (course_id, title, description, order_index)
           VALUES (?, 'Module 3: Production Docker Containerization & CI/CD', 'Deploying multi-container production environments with automated test suites.', 3)`,
          [fsCourseId]
        );
        const mod3Id = m3.insertId;

        await conn.query(
          `INSERT INTO lms_lessons (module_id, course_id, title, content, lesson_type, resource_url, duration_minutes, order_index)
           VALUES 
           (?, ?, '3.1 Multi-Stage Dockerfile Optimization', 'Shrinking container footprints from 1.2GB to 45MB with Alpine Linux and multi-stage builds.', 'DOCUMENT', 'https://docs.docker.com', 25, 1),
           (?, ?, '3.2 Automated GitHub Actions Deployment Workflow', 'Writing YAML workflows for linting, unit testing, and zero-downtime container deploy.', 'DOCUMENT', 'https://docs.github.com/actions', 30, 2)`,
          [mod3Id, fsCourseId, mod3Id, fsCourseId]
        );

        console.log('✓ Seeded modules and lessons for Full Stack course.');
      }
    }

    // Seed downloadable resources for FS-301
    if (fsCourseId) {
      await conn.query(
        `INSERT IGNORE INTO lms_course_resources (course_id, title, file_type, file_url, file_size_kb, uploaded_by)
         VALUES 
         (?, 'Full Stack Web Architecture Reference Blueprint (PDF)', 'PDF', '/uploads/blueprints/fullstack-arch.pdf', 3420, ?),
         (?, 'React 19 Core Cheatsheet & Hooks Guide', 'PDF', '/uploads/cheatsheets/react-19-guide.pdf', 1840, ?),
         (?, 'Microservices Docker Compose Starter Boilerplate (ZIP)', 'ZIP', '/uploads/code/docker-microservices-starter.zip', 512, ?),
         (?, 'Production REST API Security Checklist & OWASP Guidelines', 'PDF', '/uploads/security/owasp-api-top10.pdf', 2210, ?)`,
        [fsCourseId, instructorId, fsCourseId, instructorId, fsCourseId, instructorId, fsCourseId, instructorId]
      );
      console.log('✓ Seeded downloadable course resources.');
    }

    // Seed Quiz for FS-301
    if (fsCourseId) {
      const [existingQuizzes] = await conn.query('SELECT id FROM lms_quizzes WHERE course_id = ?', [fsCourseId]);
      if (existingQuizzes.length === 0) {
        const [quizRes] = await conn.query(
          `INSERT INTO lms_quizzes (course_id, title, description, instructions, time_limit_minutes, max_attempts, passing_score, due_date, is_published, created_by)
           VALUES (?, 'Mid-Term Assessment: Full Stack Web Architecture & React', 
           'Comprehensive evaluation covering React 19 reconciliation, Node event loops, and database indexing.',
           'Answer all questions. Once submitted, your score will be calculated and verified against placement criteria.', 
           30, 3, 70, DATE_ADD(NOW(), INTERVAL 7 DAY), 1, ?)`,
          [fsCourseId, instructorId]
        );
        const quizId = quizRes.insertId;

        const questions = [
          {
            q: 'What is the key advantage of React Server Components (RSC)?',
            options: ['Zero bundle-size overhead for server-only dependencies', 'Automatic conversion to WebAssembly', 'Removal of HTML rendering entirely', 'Elimination of databases'],
            ans: 'Zero bundle-size overhead for server-only dependencies',
            marks: 2,
            exp: 'RSC code never ships to the client bundle, keeping client-side JavaScript minimal.'
          },
          {
            q: 'In Node.js, which phase of the Event Loop executes callbacks scheduled by `process.nextTick()`?',
            options: ['Immediately after the current operation before the loop continues', 'Timers phase', 'Poll phase', 'Close callbacks phase'],
            ans: 'Immediately after the current operation before the loop continues',
            marks: 2,
            exp: 'process.nextTick queue is processed at the end of the current microtask tick before moving to next event loop phases.'
          },
          {
            q: 'Which HTTP status code should be returned when an authentication token is missing or invalid?',
            options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '500 Internal Error'],
            ans: '401 Unauthorized',
            marks: 2,
            exp: '401 Unauthorized signifies missing or invalid authentication credentials.'
          },
          {
            q: 'What is a major performance benefit of connection pooling in MySQL database clients?',
            options: ['Reuses established TCP/TLS database sockets across requests', 'Allows unlimited RAM usage', 'Eliminates SQL injection automatically', 'Encrypts frontend CSS'],
            ans: 'Reuses established TCP/TLS database sockets across requests',
            marks: 2,
            exp: 'Connection pooling eliminates the high latency overhead of establishing fresh TCP handshakes for every query.'
          },
          {
            q: 'What does a multi-stage Docker build accomplish?',
            options: ['Separates build environment and runtime environment to minimize final container image size', 'Runs containers on multiple clouds simultaneously', 'Duplicates code across Docker Hub', 'Runs Python in Java container'],
            ans: 'Separates build environment and runtime environment to minimize final container image size',
            marks: 2,
            exp: 'Build tools and intermediate files stay in early stages, copying only compile artifacts into the lean release container.'
          }
        ];

        for (const [idx, item] of questions.entries()) {
          await conn.query(
            `INSERT INTO lms_quiz_questions (quiz_id, question_text, question_type, options, correct_answer, marks, explanation, order_index)
             VALUES (?, ?, 'MCQ', ?, ?, ?, ?, ?)`,
            [quizId, item.q, JSON.stringify(item.options), item.ans, item.marks, item.exp, idx + 1]
          );
        }
        console.log('✓ Seeded quiz and 5 questions.');

        // Seed a sample completed attempt for demo student
        if (demoStudentId) {
          await conn.query(
            `INSERT INTO lms_quiz_attempts (quiz_id, student_id, attempt_number, score, max_score, percentage, passed, answers)
             VALUES (?, ?, 1, 8.00, 10.00, 80.00, 1, ?)`,
            [quizId, demoStudentId, JSON.stringify({ q1: item => true, q2: item => true })]
          );
        }
      }
    }

    // Seed Assignment for FS-301
    if (fsCourseId) {
      const [existingAssign] = await conn.query('SELECT id FROM lms_assignments WHERE course_id = ?', [fsCourseId]);
      if (existingAssign.length === 0) {
        const [assignRes] = await conn.query(
          `INSERT INTO lms_assignments (course_id, title, description, instructions, max_marks, due_date, allowed_file_types, is_published, created_by)
           VALUES (?, 'Capstone Project 1: Resilient Multi-Tier Microservice with JWT & Docker',
           'Construct a production-ready REST service with Express, MySQL with connection pooling, JWT auth, and a complete Docker Compose file.',
           'Upload your project ZIP archive or attach your verified GitHub repository link with clean commit history and documentation.',
           100, DATE_ADD(NOW(), INTERVAL 14 DAY), 'zip,pdf,js', 1, ?)`,
          [fsCourseId, instructorId]
        );
        const assignId = assignRes.insertId;

        // Seed submission by demo student
        if (demoStudentId) {
          await conn.query(
            `INSERT INTO lms_assignment_submissions (assignment_id, student_id, submission_text, github_url, file_name, status, grade, feedback, graded_by, graded_at)
             VALUES (?, ?, 'Completed full microservice architecture with rate limiting, Redis caching, and Docker compose integration.',
             'https://github.com/aditya/fullstack-microservice-hub', 'aditya_varma_capstone1.zip', 'GRADED', 94.00,
             'Exceptional project structure! Clean separation of controller, service, and data access layers. Excellent test coverage.',
             ?, NOW())`,
            [assignId, demoStudentId, instructorId]
          );
        }
        console.log('✓ Seeded assignment and student submission.');
      }
    }

    // Seed Learning Path
    const [existingPaths] = await conn.query('SELECT id FROM lms_learning_paths LIMIT 1');
    if (existingPaths.length === 0) {
      const [pathRes] = await conn.query(
        `INSERT INTO lms_learning_paths (title, description, target_role_id, department_code, estimated_weeks, course_ids, milestones, created_by)
         VALUES ('Full Stack Cloud Architect Journey', 
         'Structured learning journey engineered to transition undergraduate students into high-tier Full Stack & Cloud placement roles.',
         'full-stack-developer', 'CSE', 12, ?, ?, ?)`,
        [
          JSON.stringify([fsCourseId || 1, dsCourseId || 2, plCourseId || 4]),
          JSON.stringify([
            { id: 'm1', title: 'Phase 1: React 19 Component Systems & State Mastery', status: 'COMPLETED' },
            { id: 'm2', title: 'Phase 2: Scalable Backend Services & SQL Transactions', status: 'IN_PROGRESS' },
            { id: 'm3', title: 'Phase 3: Docker Containerization & Cloud Deployment', status: 'PENDING' },
            { id: 'm4', title: 'Phase 4: Technical Mock Interviews & LeetCode Hard Patterns', status: 'PENDING' },
          ]),
          instructorId
        ]
      );
      const pathId = pathRes.insertId;

      if (demoStudentId) {
        await conn.query(
          `INSERT INTO lms_learning_path_enrollments (path_id, student_id, progress_percentage, completed_milestones, status)
           VALUES (?, ?, 50.00, ?, 'IN_PROGRESS')`,
          [pathId, demoStudentId, JSON.stringify(['m1'])]
        );
      }
      console.log('✓ Seeded structured learning path.');
    }

    // Seed Live Classes
    if (fsCourseId) {
      const [existingClasses] = await conn.query('SELECT id FROM lms_live_classes WHERE course_id = ?', [fsCourseId]);
      if (existingClasses.length === 0) {
        await conn.query(
          `INSERT INTO lms_live_classes (course_id, title, instructor_id, start_time, duration_minutes, meeting_link, platform, status)
           VALUES 
           (?, 'Live Masterclass: Microservices Fault Tolerance with Circuit Breakers', ?, DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'https://meet.google.com/campuscorp-cse-live', 'CampusCorp Video / Meet', 'SCHEDULED'),
           (?, 'Interactive Q&A: Preparing for System Design Technical Interviews', ?, DATE_ADD(NOW(), INTERVAL 5 DAY), 75, 'https://meet.google.com/campuscorp-sysdesign', 'CampusCorp Video / Meet', 'SCHEDULED')`,
          [fsCourseId, instructorId, fsCourseId, instructorId]
        );
        console.log('✓ Seeded upcoming live classes.');
      }
    }

    // Seed Discussions
    if (fsCourseId) {
      const [existingDisc] = await conn.query('SELECT id FROM lms_discussions WHERE course_id = ?', [fsCourseId]);
      if (existingDisc.length === 0) {
        const [discRes] = await conn.query(
          `INSERT INTO lms_discussions (course_id, user_id, title, message, is_pinned, is_resolved)
           VALUES (?, ?, 'Handling Token Expiration gracefully in Axios Interceptors', 
           'When the JWT access token expires during an in-flight API call, what is the best pattern to queue requests while fetching a fresh token?', 1, 1)`,
          [fsCourseId, demoUserId]
        );
        const discId = discRes.insertId;

        await conn.query(
          `INSERT INTO lms_discussion_replies (discussion_id, user_id, reply_text, is_faculty_answer)
           VALUES (?, ?, 'Great question Aditya. Use a response interceptor with an _retry flag and an internal queue of resolve/reject callbacks. When 401 is received, request /auth/switch-role or refresh token, update Authorization header, and replay queued requests.', 1)`,
          [discId, instructorId]
        );
        console.log('✓ Seeded course discussions and faculty answer.');
      }
    }

    // Seed Student Notes
    if (fsCourseId && demoStudentId) {
      await conn.query(
        `INSERT IGNORE INTO lms_student_notes (student_id, course_id, title, note_content, is_bookmarked)
         VALUES 
         (?, ?, 'React 19 Hooks Key Summary', 'useActionState handles pending transitions natively without manual setLoading booleans. useOptimistic updates UI immediately before server ACK.', 1),
         (?, ?, 'MySQL Indexing Best Practices', 'Always create composite indexes ordered by equality columns first, then range columns. Avoid functions on indexed columns in WHERE clauses.', 1)`,
        [demoStudentId, fsCourseId, demoStudentId, fsCourseId]
      );
      console.log('✓ Seeded student notes & bookmarks.');
    }

    // Seed Completed Certificate
    if (plCourseId && demoStudentId) {
      await conn.query(
        `INSERT IGNORE INTO lms_certificates (id, student_id, course_id, issue_date, grade_achieved, verification_hash, is_approved, approved_by)
         VALUES ('CERT-PLC-2026-9042', ?, ?, '2026-10-10', 'A+', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, ?)`,
        [demoStudentId, plCourseId, instructorId]
      );
      console.log('✓ Seeded student completion certificate.');
    }

    // Seed Student Portfolio Project
    if (demoStudentId) {
      await conn.query(
        `INSERT IGNORE INTO lms_student_portfolio_projects (student_id, course_id, title, description, technologies, github_url, live_demo_url, is_featured, faculty_approved)
         VALUES (?, ?, 'Cloud-Native Placement Workflow Engine', 
         'Distributed placement portal with real-time WebRTC mock interview rooms, live assessment code sandboxes, and automated score aggregators.',
         ?, 'https://github.com/aditya/placement-workflow-engine', 'https://placement-engine.demo.edu', 1, 1)`,
        [demoStudentId, fsCourseId || 1, JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Docker', 'WebRTC'])]
      );
      console.log('✓ Seeded student portfolio project.');
    }

    // Seed Announcements
    await conn.query(
      `INSERT IGNORE INTO lms_announcements (course_id, department_code, title, content, author_id, priority)
       VALUES 
       (?, 'CSE', 'Mid-Term Capstone Submissions Open & Plagiarism Checks', 
       'All students must upload their project code by Friday 11:59 PM. Automated linting, build pipelines, and anti-plagiarism checks will run upon submission.', ?, 'IMPORTANT'),
       (NULL, 'CSE', 'Upcoming Campus Recruitment Drives — Skill Analyzer Verification Required',
       'Google, Microsoft, and Amazon campus recruitment drives commence next month. Complete your LMS coursework and verify your Skill Analyzer credentials.', ?, 'URGENT')`,
      [fsCourseId || 1, instructorId, instructorId]
    );
    console.log('✓ Seeded department & course announcements.');

    // Seed Notifications for Demo Student
    if (demoUserId) {
      await conn.query(
        `INSERT IGNORE INTO lms_notifications (user_id, type, title, message, link_url, is_read)
         VALUES 
         (?, 'GRADE_POSTED', 'Assignment Graded: Capstone Project 1', 'Prof. Suresh graded your assignment with 94/100 and provided detailed code review.', '/lms/assignments', 0),
         (?, 'QUIZ_RELEASED', 'New Quiz Available: Full Stack Architecture', 'Mid-Term Assessment is now live with 3 attempts permitted. Deadline in 7 days.', '/lms/quizzes', 0),
         (?, 'LIVE_CLASS', 'Upcoming Live Masterclass Scheduled', 'Microservices Fault Tolerance with Circuit Breakers starts in 2 days.', '/lms/live-classes', 0),
         (?, 'BADGE_EARNED', 'Certificate Issued: Placement Readiness', 'Congratulations! You earned the official CampusCorp Placement Mastery Certificate.', '/lms/certificates', 1)`,
        [demoUserId, demoUserId, demoUserId, demoUserId]
      );
      console.log('✓ Seeded student notifications.');
    }

    console.log('================================================================');
    console.log('✅ [LMS MIGRATION COMPLETE] All 22 LMS Tables & Seed Data Ready!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ LMS Migration failed:', err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

if (require.main === module) {
  runLmsIntegrationMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runLmsIntegrationMigration };
