const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function runLmsSemesterAccessMigration() {
  console.log('================================================================');
  console.log('🚀 [MIGRATION] CampusCorp LMS Semester-Wise Access & Faculty Mapping');
  console.log('================================================================');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const conn = await pool.getConnection();

  try {
    // 1. Helper to add column if not exists
    const addColumnIfNotExists = async (table, column, definition) => {
      try {
        const [rows] = await conn.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
        if (rows.length === 0) {
          await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`   ✓ Added column ${column} to ${table}`);
        } else {
          console.log(`   - Column ${column} already exists on ${table}`);
        }
      } catch (e) {
        console.warn(`   ! Warning on ${table}.${column}:`, e.message);
      }
    };

    console.log('\n[STEP 1] Extending lms_courses with semester-wise fields...');
    await addColumnIfNotExists('lms_courses', 'academic_year', "VARCHAR(20) DEFAULT '2026-2027'");
    await addColumnIfNotExists('lms_courses', 'semester', 'INT NOT NULL DEFAULT 5');
    await addColumnIfNotExists('lms_courses', 'class_name', "VARCHAR(100) DEFAULT 'CSE-A'");
    await addColumnIfNotExists('lms_courses', 'section', "VARCHAR(20) DEFAULT 'A'");
    await addColumnIfNotExists('lms_courses', 'subject_type', "ENUM('THEORY', 'LAB', 'ELECTIVE', 'PROJECT') DEFAULT 'THEORY'");
    await addColumnIfNotExists('lms_courses', 'credits', 'INT DEFAULT 3');
    await addColumnIfNotExists('lms_courses', 'syllabus', 'TEXT NULL');

    console.log('\n[STEP 2] Creating lms_faculty_course_assignments table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lms_faculty_course_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        faculty_id INT NOT NULL,
        role_type ENUM('PRIMARY_FACULTY', 'CO_FACULTY', 'LAB_INSTRUCTOR') DEFAULT 'PRIMARY_FACULTY',
        assigned_by_user_id INT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_course_faculty (course_id, faculty_id),
        INDEX idx_faculty (faculty_id),
        INDEX idx_course (course_id)
      ) ENGINE=InnoDB
    `);
    console.log('✓ lms_faculty_course_assignments table ready.');

    console.log('\n[STEP 3] Extending academic_structures & students_master...');
    await addColumnIfNotExists('academic_structures', 'class_advisor_id', 'INT NULL');
    await addColumnIfNotExists('students_master', 'class_name', "VARCHAR(100) DEFAULT 'CSE-A'");
    await addColumnIfNotExists('students_master', 'section', "VARCHAR(20) DEFAULT 'A'");

    console.log('\n[STEP 4] Seeding Genuine Faculty Accounts...');
    const defaultHash = await bcrypt.hash('Password123!', 10);

    const facultyMembers = [
      {
        email: 'hod.cse@college.edu',
        first_name: 'Prof. Suresh',
        last_name: 'Venkatesh',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
      {
        email: 'rajesh.iyer@college.edu',
        first_name: 'Prof. Rajesh',
        last_name: 'Iyer',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
      {
        email: 'a.nambiar@college.edu',
        first_name: 'Prof. A.',
        last_name: 'Nambiar',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
      {
        email: 'shalini.roy@college.edu',
        first_name: 'Prof. Shalini',
        last_name: 'Roy',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
      {
        email: 'k.ramanathan@college.edu',
        first_name: 'Dr. K.',
        last_name: 'Ramanathan',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
      {
        email: 'priya.chandran@college.edu',
        first_name: 'Prof. Priya',
        last_name: 'Chandran',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
      {
        email: 'm.karthikeyan@college.edu',
        first_name: 'Prof. M.',
        last_name: 'Karthikeyan',
        role_name: 'FACULTY_COORDINATOR',
        department_code: 'CSE',
      },
    ];

    const facultyIdMap = {};

    for (const f of facultyMembers) {
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [f.email]);
      if (existing.length > 0) {
        facultyIdMap[f.email] = existing[0].id;
        await conn.query(
          'UPDATE users SET first_name = ?, last_name = ?, role_name = ?, department_code = ? WHERE id = ?',
          [f.first_name, f.last_name, f.role_name, f.department_code, existing[0].id]
        );
        console.log(`   ✓ Updated existing faculty user: ${f.first_name} ${f.last_name} (ID: ${existing[0].id})`);
      } else {
        const [result] = await conn.query(`
          INSERT INTO users (uuid, email, password_hash, role_id, role_name, first_name, last_name, department_code, status)
          VALUES (?, ?, ?, 4, ?, ?, ?, ?, 'ACTIVE')
        `, [uuidv4(), f.email, defaultHash, f.role_name, f.first_name, f.last_name, f.department_code]);
        facultyIdMap[f.email] = result.insertId;
        console.log(`   ✓ Inserted new faculty user: ${f.first_name} ${f.last_name} (ID: ${result.insertId})`);
      }
    }

    console.log('\n[STEP 5] Updating Class Advisor IDs in academic_structures...');
    if (facultyIdMap['a.nambiar@college.edu']) {
      await conn.query(
        "UPDATE academic_structures SET class_advisor_id = ?, class_advisor_name = 'Prof. A. Nambiar', class_advisor_email = 'a.nambiar@college.edu' WHERE dept_code = 'CSE' AND semester = 5 AND section = 'A'",
        [facultyIdMap['a.nambiar@college.edu']]
      );
      console.log('   ✓ Set Prof. A. Nambiar as Class Advisor for CSE Semester 5, Section A');
    }
    if (facultyIdMap['rajesh.iyer@college.edu']) {
      await conn.query(
        "UPDATE academic_structures SET class_advisor_id = ?, class_advisor_name = 'Prof. Rajesh Iyer', class_advisor_email = 'rajesh.iyer@college.edu' WHERE dept_code = 'CSE' AND semester = 7 AND section = 'A'",
        [facultyIdMap['rajesh.iyer@college.edu']]
      );
      console.log('   ✓ Set Prof. Rajesh Iyer as Class Advisor for CSE Semester 7, Section A');
    }

    console.log('\n[STEP 6] Seeding Real-World Semester 5 Subjects for CSE-A Section A (7 Subjects)...');
    const sem5Courses = [
      {
        course_code: 'CS501',
        title: 'Database Management Systems & SQL Architecture',
        description: 'Relational data modeling, ACID transactions, relational algebra, indexing, B-trees, query optimization, and normalization.',
        category: 'Core Computer Science',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 4,
        instructor_email: 'hod.cse@college.edu',
        level: 'INTERMEDIATE',
        syllabus: 'Unit I: Relational Model; Unit II: SQL & Constraints; Unit III: Normalization 1NF to BCNF; Unit IV: Transactions & Concurrency; Unit V: Storage & Indexing.',
      },
      {
        course_code: 'CS502',
        title: 'Computer Networks & Internet Protocols',
        description: 'OSI and TCP/IP stack, routing protocols, flow control, congestion management, socket programming, and transport layer security.',
        category: 'Networking & Systems',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 3,
        instructor_email: 'rajesh.iyer@college.edu',
        level: 'INTERMEDIATE',
        syllabus: 'Unit I: Physical & Data Link Layer; Unit II: MAC Sublayer; Unit III: Network Layer & Routing; Unit IV: Transport Layer (TCP/UDP); Unit V: Application Layer & DNS.',
      },
      {
        course_code: 'CS503',
        title: 'Theory of Computation & Automata Theory',
        description: 'Finite automata, regular expressions, context-free grammars, pushdown automata, Turing machines, decidability, and Halting problem.',
        category: 'Theoretical Computer Science',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 4,
        instructor_email: 'a.nambiar@college.edu', // Class Advisor
        level: 'ADVANCED',
        syllabus: 'Unit I: Regular Languages & DFA/NFA; Unit II: Pumping Lemma; Unit III: Context-Free Grammars & PDA; Unit IV: Turing Machines; Unit V: Undecidability.',
      },
      {
        course_code: 'CS504',
        title: 'Design and Analysis of Algorithms',
        description: 'Asymptotic notation, divide-and-conquer, greedy algorithms, dynamic programming, graph algorithms, and NP-completeness.',
        category: 'Core Computer Science',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 4,
        instructor_email: 'shalini.roy@college.edu',
        level: 'ADVANCED',
        syllabus: 'Unit I: Recurrence Relations; Unit II: Divide & Conquer (Merge/Quick Sort); Unit III: Dynamic Programming; Unit IV: Greedy & Shortest Paths; Unit V: NP-Hard & Approximation.',
      },
      {
        course_code: 'CS505',
        title: 'Web Technology & Microservices Architecture',
        description: 'Client-server protocols, modern HTML5/CSS, React 19, RESTful APIs, Node.js microservices, Docker containerization, and state management.',
        category: 'Full Stack Engineering',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 3,
        instructor_email: 'k.ramanathan@college.edu',
        level: 'INTERMEDIATE',
        syllabus: 'Unit I: Web Architecture & DOM; Unit II: React & Components; Unit III: REST & Express.js; Unit IV: Asynchronous State & JWT; Unit V: Microservices & Deployment.',
      },
      {
        course_code: 'CS506',
        title: 'Software Engineering & Agile Methodologies',
        description: 'Software development lifecycle, Agile Scrum framework, Jira workflows, software testing (TDD/BDD), CI/CD pipelines, and design patterns.',
        category: 'Software Engineering',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 3,
        instructor_email: 'priya.chandran@college.edu',
        level: 'BEGINNER',
        syllabus: 'Unit I: Process Models & Agile; Unit II: Requirements Engineering; Unit III: Architectural Design; Unit IV: Verification & Validation; Unit V: DevOps & Maintenance.',
      },
      {
        course_code: 'CS507',
        title: 'DBMS & Network Virtualization Laboratory',
        description: 'Hands-on practical implementation of complex SQL joins, triggers, stored procedures, transaction isolation, Wireshark packet analysis, and socket programming.',
        category: 'Practical Laboratory',
        department_code: 'CSE',
        semester: 5,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'LAB',
        credits: 2,
        instructor_email: 'm.karthikeyan@college.edu',
        level: 'INTERMEDIATE',
        syllabus: 'Lab 1: DDL/DML Operations; Lab 2: PL/SQL Triggers; Lab 3: Index Benchmarks; Lab 4: Packet Sniffing with Wireshark; Lab 5: TCP Socket Server in Python.',
      },
    ];

    console.log('\n[STEP 7] Seeding Semester 7 Subjects for CSE-A Section A (5 Subjects)...');
    const sem7Courses = [
      {
        course_code: 'CS701',
        title: 'Cloud Architecture & Distributed Systems (AWS & K8s)',
        description: 'Enterprise cloud patterns, microservice orchestration with Kubernetes, AWS Lambda, serverless computing, and distributed consensus.',
        category: 'Cloud & Infrastructure',
        department_code: 'CSE',
        semester: 7,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 4,
        instructor_email: 'hod.cse@college.edu',
        level: 'ADVANCED',
        syllabus: 'Unit I: Distributed Computing Foundations; Unit II: Cloud Virtualization & Containers; Unit III: Kubernetes Pods & Services; Unit IV: Serverless & API Gateways; Unit V: Resiliency & Chaos Engineering.',
      },
      {
        course_code: 'CS702',
        title: 'Deep Learning & Applied Computer Vision',
        description: 'Convolutional neural networks, transformer architectures, PyTorch implementation, object detection (YOLO), and transfer learning.',
        category: 'Artificial Intelligence',
        department_code: 'CSE',
        semester: 7,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 4,
        instructor_email: 'priya.chandran@college.edu',
        level: 'ADVANCED',
        syllabus: 'Unit I: Deep Neural Networks; Unit II: Backpropagation & Optimization; Unit III: CNN Architectures; Unit IV: Attention & Transformers; Unit V: Generative Models.',
      },
      {
        course_code: 'CS703',
        title: 'Cyber Security & Network Defense Systems',
        description: 'Public-key cryptography, penetration testing methodologies, zero-trust network architectures, OWASP Top 10 vulnerabilities, and security operations.',
        category: 'Cyber Security',
        department_code: 'CSE',
        semester: 7,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 3,
        instructor_email: 'rajesh.iyer@college.edu',
        level: 'ADVANCED',
        syllabus: 'Unit I: Cryptographic Primitives; Unit II: Network Attacks & Mitigations; Unit III: Web App Security (OWASP); Unit IV: Zero Trust & IAM; Unit V: Threat Hunting & SIEM.',
      },
      {
        course_code: 'CS704',
        title: 'Big Data Engineering & Apache Spark Analytics',
        description: 'Hadoop distributed file system (HDFS), Apache Spark RDDs and DataFrames, streaming data pipelines with Kafka, and cloud data warehouses.',
        category: 'Data Engineering',
        department_code: 'CSE',
        semester: 7,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'THEORY',
        credits: 3,
        instructor_email: 'k.ramanathan@college.edu',
        level: 'INTERMEDIATE',
        syllabus: 'Unit I: Big Data Landscape & HDFS; Unit II: MapReduce Paradigm; Unit III: Spark Core & DataFrames; Unit IV: Real-Time Stream Processing; Unit V: Delta Lakes & Analytics.',
      },
      {
        course_code: 'CS705',
        title: 'Final Year Capstone Engineering Project',
        description: 'Industry-sponsored or research-driven major software engineering capstone with sprint reviews, architecture documentation, and code audits.',
        category: 'Project & Capstone',
        department_code: 'CSE',
        semester: 7,
        academic_year: '2026-2027',
        class_name: 'CSE-A',
        section: 'A',
        subject_type: 'PROJECT',
        credits: 6,
        instructor_email: 'shalini.roy@college.edu',
        level: 'ADVANCED',
        syllabus: 'Milestone 1: Problem Definition & Literature Survey; Milestone 2: Architecture & Low-Level Design; Milestone 3: Alpha Prototype & Sprint Demo; Milestone 4: Beta Testing; Milestone 5: Final Viva.',
      },
    ];

    const allCoursesToSeed = [...sem5Courses, ...sem7Courses];

    for (const c of allCoursesToSeed) {
      const instructorId = facultyIdMap[c.instructor_email] || 4;

      const [existingCourse] = await conn.query(
        'SELECT id FROM lms_courses WHERE course_code = ? AND department_code = ? AND semester = ? AND section = ?',
        [c.course_code, c.department_code, c.semester, c.section]
      );

      let courseId;
      if (existingCourse.length > 0) {
        courseId = existingCourse[0].id;
        await conn.query(`
          UPDATE lms_courses 
          SET title = ?, description = ?, category = ?, instructor_id = ?, 
              academic_year = ?, semester = ?, class_name = ?, section = ?,
              subject_type = ?, credits = ?, syllabus = ?, status = 'PUBLISHED',
              duration_hours = 45, passing_percentage = 50, certificate_enabled = 1
          WHERE id = ?
        `, [
          c.title, c.description, c.category, instructorId,
          c.academic_year, c.semester, c.class_name, c.section,
          c.subject_type, c.credits, c.syllabus, courseId
        ]);
        console.log(`   ✓ Updated course ${c.course_code}: ${c.title} (Faculty ID: ${instructorId})`);
      } else {
        const [insertRes] = await conn.query(`
          INSERT INTO lms_courses 
          (course_code, title, description, category, department_code, instructor_id, 
           academic_year, semester, class_name, section, subject_type, credits, syllabus,
           duration_hours, passing_percentage, certificate_enabled, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 45, 50, 1, 'PUBLISHED')
        `, [
          c.course_code, c.title, c.description, c.category, c.department_code, instructorId,
          c.academic_year, c.semester, c.class_name, c.section, c.subject_type, c.credits, c.syllabus
        ]);
        courseId = insertRes.insertId;
        console.log(`   ✓ Created course ${c.course_code}: ${c.title} (ID: ${courseId}, Faculty ID: ${instructorId})`);
      }

      // Link in lms_faculty_course_assignments
      await conn.query(`
        INSERT INTO lms_faculty_course_assignments (course_id, faculty_id, role_type, is_active)
        VALUES (?, ?, 'PRIMARY_FACULTY', 1)
        ON DUPLICATE KEY UPDATE is_active = 1, role_type = 'PRIMARY_FACULTY'
      `, [courseId, instructorId]);

      // Seed study material resources for this course
      const [resCount] = await conn.query('SELECT COUNT(*) as cnt FROM lms_course_resources WHERE course_id = ?', [courseId]);
      if (resCount[0].cnt === 0) {
        await conn.query(`
          INSERT INTO lms_course_resources (course_id, title, description, file_url, file_type, file_size_kb, uploaded_by, is_published, target_section)
          VALUES 
            (?, CONCAT(?, ' - Complete Official Syllabus & Lecture Schedule'), 'Detailed syllabus breakdown with reference textbooks and evaluation criteria.', 'https://campuscorp.edu/lms/syllabus.pdf', 'PDF', 1420, ?, 1, 'ALL'),
            (?, CONCAT(?, ' - Unit 1 & 2 Comprehensive Lecture Notes'), 'Faculty curated comprehensive notes, diagrams, and solved examples.', 'https://campuscorp.edu/lms/notes_unit1.pdf', 'PDF', 3150, ?, 1, 'ALL'),
            (?, CONCAT(?, ' - Interactive Architecture Slides & Reference Cheatsheet'), 'Presentation deck and syntax quick-reference guide.', 'https://campuscorp.edu/lms/slides.pptx', 'PPT', 5800, ?, 1, 'ALL')
        `, [
          courseId, c.course_code, instructorId,
          courseId, c.course_code, instructorId,
          courseId, c.course_code, instructorId
        ]);
      }

      // Seed quiz for this course
      const [quizCount] = await conn.query('SELECT COUNT(*) as cnt FROM lms_quizzes WHERE course_id = ?', [courseId]);
      if (quizCount[0].cnt === 0) {
        const [quizRes] = await conn.query(`
          INSERT INTO lms_quizzes (course_id, title, description, time_limit_minutes, passing_score, is_published, due_date, created_by)
          VALUES (?, CONCAT(?, ' - Mid-Term Concept Assessment & Quiz'), 'Evaluates conceptual understanding of foundational units and problem-solving.', 30, 60, 1, DATE_ADD(NOW(), INTERVAL 14 DAY), ?)
        `, [courseId, c.course_code, instructorId]);
        const quizId = quizRes.insertId;

        // Quiz questions
        await conn.query(`
          INSERT INTO lms_quiz_questions (quiz_id, question_text, question_type, options, correct_answer, marks)
          VALUES 
            (?, 'What is the primary objective of this subject in computer science engineering?', 'MULTIPLE_CHOICE', '["To optimize system architectures and algorithmic efficiency", "To format UI components only", "To memorize historical facts", "None of the above"]', 'To optimize system architectures and algorithmic efficiency', 2),
            (?, 'Which of the following computational guarantees is prioritized by this core module?', 'MULTIPLE_CHOICE', '["Strict Correctness, Modularity & Performance", "Trial and error execution", "Arbitrary state mutation", "Unconstrained resource usage"]', 'Strict Correctness, Modularity & Performance', 2)
        `, [quizId, quizId]);
      }

      // Seed assignment for this course
      const [assignCount] = await conn.query('SELECT COUNT(*) as cnt FROM lms_assignments WHERE course_id = ?', [courseId]);
      if (assignCount[0].cnt === 0) {
        await conn.query(`
          INSERT INTO lms_assignments (course_id, title, description, max_marks, is_published, due_date, created_by)
          VALUES (?, CONCAT(?, ' - Practical Implementation Assignment 1'), 'Complete the hands-on implementation problem, write test cases, and submit your source code archive with a summary report.', 100, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)
        `, [courseId, c.course_code, instructorId]);
      }
    }

    console.log('\n[STEP 8] Enrolling Students into Semester Courses...');
    // Fetch all enrolled students
    const [students] = await conn.query('SELECT id, user_id, department_code, current_semester FROM students_master');

    for (const s of students) {
      // Find all courses matching student's department and semester
      const [matchingCourses] = await conn.query(
        'SELECT id FROM lms_courses WHERE department_code = ? AND semester = ?',
        [s.department_code, s.current_semester]
      );

      for (const mc of matchingCourses) {
        await conn.query(`
          INSERT INTO lms_course_enrollments (course_id, student_id, enrolled_at, status, progress_percentage)
          VALUES (?, ?, NOW(), 'ENROLLED', 25.0)
          ON DUPLICATE KEY UPDATE status = 'ENROLLED'
        `, [mc.id, s.id]);
      }

      console.log(`   ✓ Student ID ${s.id} (${s.department_code} Sem ${s.current_semester}) enrolled in ${matchingCourses.length} semester courses.`);
    }

    console.log('\n================================================================');
    console.log('✅ [LMS SEMESTER MIGRATION COMPLETED SUCCESSFULLY]');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Migration Error:', err);
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

runLmsSemesterAccessMigration()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
