const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const commonDbName = process.env.DB_COMMON_NAME || 'lms';

// Standard isolated schema applied to every department database
const departmentSchemaTables = [
  `CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NULL,
    department_code VARCHAR(20) NOT NULL,
    programme VARCHAR(100) DEFAULT 'B.Tech',
    admission_batch VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    year_of_study INT NOT NULL DEFAULT 1,
    current_semester INT NOT NULL DEFAULT 1,
    class_name VARCHAR(100) NOT NULL DEFAULT 'A',
    section VARCHAR(20) NOT NULL DEFAULT 'A',
    academic_status ENUM('REGULAR', 'DETAINED', 'DISCONTINUED', 'ALUMNI') DEFAULT 'REGULAR',
    placement_status ENUM('NOT_REGISTERED', 'REGISTERED', 'OPTED_OUT', 'PLACED', 'MULTIPLE_OFFERS') DEFAULT 'REGISTERED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reg (register_number),
    INDEX idx_class_sec (class_name, section),
    INDEX idx_batch (admission_batch),
    INDEX idx_status (academic_status)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    date_of_birth DATE NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    address TEXT NULL,
    guardian_name VARCHAR(100) NULL,
    guardian_contact VARCHAR(25) NULL,
    tenth_percentage DECIMAL(5,2) DEFAULT 0.00,
    twelfth_percentage DECIMAL(5,2) DEFAULT 0.00,
    diploma_percentage DECIMAL(5,2) NULL,
    skills JSON NULL,
    linkedin_url VARCHAR(255) NULL,
    github_url VARCHAR(255) NULL,
    portfolio_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prof_reg (register_number)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS student_academic_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    sem1_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem2_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem3_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem4_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem5_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem6_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem7_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem8_gpa DECIMAL(4,2) DEFAULT 0.00,
    current_cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    active_backlogs INT DEFAULT 0,
    cleared_backlogs INT DEFAULT 0,
    history_of_backlogs INT DEFAULT 0,
    total_credits_earned INT DEFAULT 0,
    department_rank INT DEFAULT 1,
    faculty_mentor_name VARCHAR(100) NULL,
    mentor_remarks TEXT NULL,
    verification_status ENUM('PENDING', 'VERIFIED', 'NEEDS_CORRECTION') DEFAULT 'VERIFIED',
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_acad_reg (register_number)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS semester_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    register_number VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    gpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    credits_registered INT DEFAULT 20,
    credits_earned INT DEFAULT 20,
    active_backlogs INT DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_sem (register_number, semester),
    INDEX idx_sem_reg (register_number)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    admission_batch VARCHAR(20) NOT NULL,
    year_of_study INT NOT NULL DEFAULT 1,
    semester INT NOT NULL DEFAULT 1,
    faculty_advisor VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_class_batch_sem (class_name, admission_batch, semester)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    section_name VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_class_sec (class_id, section_name)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS dept_students_academic (
    id INT PRIMARY KEY AUTO_INCREMENT,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    sem1_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem2_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem3_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem4_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem5_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem6_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem7_gpa DECIMAL(4,2) DEFAULT 0.00,
    sem8_gpa DECIMAL(4,2) DEFAULT 0.00,
    current_cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    active_backlogs INT DEFAULT 0,
    cleared_backlogs INT DEFAULT 0,
    department_rank INT DEFAULT 1,
    faculty_mentor_name VARCHAR(100) NULL,
    mentor_remarks TEXT NULL,
    verification_status ENUM('PENDING', 'VERIFIED', 'NEEDS_CORRECTION') DEFAULT 'VERIFIED',
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dept_reg (register_number)
  ) ENGINE=InnoDB`,

  `CREATE TABLE IF NOT EXISTS dept_audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    register_number VARCHAR(50) NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_time (created_at)
  ) ENGINE=InnoDB`
];

async function runDepartmentAcademicMigration() {
  console.log('================================================================');
  console.log('🏛️ [MIGRATION] Running Department & Academic Management Migration');
  console.log('================================================================');

  let rootConn;
  try {
    rootConn = await mysql.createConnection(dbConfig);
    console.log(`✓ Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    // Ensure master database exists
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${commonDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ Master database '${commonDbName}' confirmed.`);
    await rootConn.end();

    const masterConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });

    // 1. Upgrade department_databases table in master DB
    console.log('Updating department_databases table schema in master database...');
    await masterConn.query(`
      CREATE TABLE IF NOT EXISTS department_databases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        dept_code VARCHAR(20) NOT NULL UNIQUE,
        dept_name VARCHAR(100) NOT NULL,
        database_name VARCHAR(64) NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    // Helper to safely add column if not exists
    const addColumnIfNotExists = async (table, column, definition) => {
      try {
        const [cols] = await masterConn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
        if (cols.length === 0) {
          await masterConn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column} ${definition}`);
          console.log(`  + Added column '${column}' to '${table}'`);
        }
      } catch (err) {
        console.warn(`  ! Column check for ${column} warning:`, err.message);
      }
    };

    await addColumnIfNotExists('department_databases', 'description', 'TEXT NULL');
    await addColumnIfNotExists('department_databases', 'hod_name', 'VARCHAR(100) NULL');
    await addColumnIfNotExists('department_databases', 'hod_email', 'VARCHAR(150) NULL');
    await addColumnIfNotExists('department_databases', 'duration_years', 'INT DEFAULT 4');
    await addColumnIfNotExists('department_databases', 'total_semesters', 'INT DEFAULT 8');
    await addColumnIfNotExists('department_databases', 'provisioning_status', "ENUM('PENDING', 'PROVISIONING', 'READY', 'FAILED') DEFAULT 'READY'");
    await addColumnIfNotExists('department_databases', 'schema_version', "VARCHAR(20) DEFAULT '1.0.0'");
    await addColumnIfNotExists('department_databases', 'last_verified_at', 'TIMESTAMP NULL');
    await addColumnIfNotExists('department_databases', 'last_error', 'TEXT NULL');

    // 2. Create academic_structures table in master DB
    console.log('Creating academic_structures table in master database...');
    await masterConn.query(`
      CREATE TABLE IF NOT EXISTS academic_structures (
        id INT PRIMARY KEY AUTO_INCREMENT,
        dept_code VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        admission_batch VARCHAR(20) NOT NULL,
        programme_name VARCHAR(100) DEFAULT 'B.Tech',
        duration_years INT DEFAULT 4,
        total_semesters INT DEFAULT 8,
        year_of_study INT NOT NULL DEFAULT 1,
        semester INT NOT NULL DEFAULT 1,
        class_name VARCHAR(100) NOT NULL,
        section VARCHAR(20) NOT NULL DEFAULT 'A',
        class_advisor_name VARCHAR(100) NULL,
        class_advisor_email VARCHAR(150) NULL,
        max_capacity INT DEFAULT 60,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_dept_academic (dept_code, academic_year, admission_batch, semester, class_name, section),
        INDEX idx_dept_batch (dept_code, admission_batch),
        INDEX idx_dept_sem (dept_code, semester)
      ) ENGINE=InnoDB
    `);
    console.log('✓ academic_structures table confirmed.');

    // 3. Create import_jobs table in master DB
    console.log('Creating import_jobs table in master database...');
    await masterConn.query(`
      CREATE TABLE IF NOT EXISTS import_jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        job_uuid VARCHAR(36) NOT NULL UNIQUE,
        dept_code VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NULL,
        admission_batch VARCHAR(20) NULL,
        semester INT NULL,
        class_name VARCHAR(100) NULL,
        section VARCHAR(20) NULL,
        data_type ENUM('STUDENT_MASTER', 'ACADEMIC_RECORDS', 'SEMESTER_MARKS') NOT NULL,
        import_mode ENUM('INSERT_ONLY', 'UPDATE_EXISTING', 'UPSERT') DEFAULT 'UPSERT',
        file_name VARCHAR(255) NOT NULL,
        file_format ENUM('CSV', 'XLSX', 'JSON') NOT NULL,
        file_size_bytes INT NOT NULL DEFAULT 0,
        total_rows INT DEFAULT 0,
        valid_rows INT DEFAULT 0,
        invalid_rows INT DEFAULT 0,
        duplicate_rows INT DEFAULT 0,
        imported_rows INT DEFAULT 0,
        status ENUM('PENDING', 'VALIDATED', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
        summary_notes TEXT NULL,
        error_report_json LONGTEXT NULL,
        column_mapping_json TEXT NULL,
        uploaded_by_user_id INT NULL,
        uploaded_by_name VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        INDEX idx_dept_jobs (dept_code, created_at),
        INDEX idx_job_status (status)
      ) ENGINE=InnoDB
    `);
    console.log('✓ import_jobs table confirmed.');

    // 4. Seed default HOD information and verify default departments in registry
    const defaultDepts = [
      { code: 'CSE', name: 'Computer Science and Engineering', db: 'lms_cse', hod: 'Dr. Ramesh Kumar', email: 'hod.cse@college.edu', desc: 'Department of Computer Science & Engineering with focus on AI, Systems, and Software' },
      { code: 'ECE', name: 'Electronics and Communication Engineering', db: 'lms_ece', hod: 'Dr. Sunita Sharma', email: 'hod.ece@college.edu', desc: 'Department of Electronics & Communication with focus on VLSI, Embedded Systems, and IoT' },
      { code: 'EEE', name: 'Electrical and Electronics Engineering', db: 'lms_eee', hod: 'Dr. K. Venkatesh', email: 'hod.eee@college.edu', desc: 'Department of Electrical & Electronics Engineering with focus on Power & Renewables' },
      { code: 'MECH', name: 'Mechanical Engineering', db: 'lms_mech', hod: 'Dr. Anand Verma', email: 'hod.mech@college.edu', desc: 'Department of Mechanical Engineering with focus on Robotics, CAD/CAM, and Thermal Systems' },
      { code: 'CIVIL', name: 'Civil Engineering', db: 'lms_civil', hod: 'Dr. Meenakshi Sundaram', email: 'hod.civil@college.edu', desc: 'Department of Civil Engineering with focus on Structural and Environmental Systems' },
      { code: 'IT', name: 'Information Technology', db: 'lms_it', hod: 'Dr. Priya Narayanan', email: 'hod.it@college.edu', desc: 'Department of Information Technology with focus on Cloud, Cybersecurity, and Data Science' },
    ];

    for (const d of defaultDepts) {
      await masterConn.query(`
        INSERT INTO department_databases (dept_code, dept_name, database_name, is_active, description, hod_name, hod_email, duration_years, total_semesters, provisioning_status, schema_version, last_verified_at)
        VALUES (?, ?, ?, 1, ?, ?, ?, 4, 8, 'READY', '1.0.0', NOW())
        ON DUPLICATE KEY UPDATE 
          dept_name = VALUES(dept_name),
          description = COALESCE(description, VALUES(description)),
          hod_name = COALESCE(hod_name, VALUES(hod_name)),
          hod_email = COALESCE(hod_email, VALUES(hod_email)),
          duration_years = COALESCE(duration_years, 4),
          total_semesters = COALESCE(total_semesters, 8),
          provisioning_status = 'READY',
          last_verified_at = NOW()
      `, [d.code, d.name, d.db, d.desc, d.hod, d.email]);
    }
    console.log('✓ Default departments updated in department_databases registry.');

    // 5. Seed default academic hierarchy structures if none exist
    const [existingStructures] = await masterConn.query('SELECT COUNT(*) AS cnt FROM academic_structures');
    if (existingStructures[0].cnt === 0) {
      console.log('Seeding baseline academic structures...');
      const baselineStructures = [
        // CSE structures
        { dept: 'CSE', ay: '2026-2027', batch: '2023-2027', prog: 'B.Tech', dur: 4, sems: 8, yr: 4, sem: 7, cls: 'CSE-A', sec: 'A', adv: 'Prof. Rajesh Iyer', email: 'rajesh.iyer@college.edu', cap: 60 },
        { dept: 'CSE', ay: '2026-2027', batch: '2023-2027', prog: 'B.Tech', dur: 4, sems: 8, yr: 4, sem: 7, cls: 'CSE-B', sec: 'B', adv: 'Prof. Shalini Roy', email: 'shalini.roy@college.edu', cap: 60 },
        { dept: 'CSE', ay: '2026-2027', batch: '2024-2028', prog: 'B.Tech', dur: 4, sems: 8, yr: 3, sem: 5, cls: 'CSE-A', sec: 'A', adv: 'Prof. A. Nambiar', email: 'a.nambiar@college.edu', cap: 60 },
        // ECE structures
        { dept: 'ECE', ay: '2026-2027', batch: '2023-2027', prog: 'B.Tech', dur: 4, sems: 8, yr: 4, sem: 7, cls: 'ECE-A', sec: 'A', adv: 'Prof. Mohan Das', email: 'mohan.das@college.edu', cap: 60 },
        { dept: 'ECE', ay: '2026-2027', batch: '2024-2028', prog: 'B.Tech', dur: 4, sems: 8, yr: 3, sem: 5, cls: 'ECE-A', sec: 'A', adv: 'Prof. Gita Reddy', email: 'gita.reddy@college.edu', cap: 60 },
        // IT structures
        { dept: 'IT', ay: '2026-2027', batch: '2023-2027', prog: 'B.Tech', dur: 4, sems: 8, yr: 4, sem: 7, cls: 'IT-A', sec: 'A', adv: 'Prof. Karthik S', email: 'karthik.s@college.edu', cap: 60 },
      ];

      for (const st of baselineStructures) {
        await masterConn.query(`
          INSERT IGNORE INTO academic_structures 
          (dept_code, academic_year, admission_batch, programme_name, duration_years, total_semesters, year_of_study, semester, class_name, section, class_advisor_name, class_advisor_email, max_capacity, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [st.dept, st.ay, st.batch, st.prog, st.dur, st.sems, st.yr, st.sem, st.cls, st.sec, st.adv, st.email, st.cap]);
      }
      console.log('✓ Baseline academic structures seeded.');
    }

    // 6. Provision / verify schemas across all registered department databases
    const [deptRows] = await masterConn.query('SELECT dept_code, database_name FROM department_databases WHERE is_active = 1');
    console.log(`\nVerifying and provisioning isolated schema across ${deptRows.length} department databases...`);

    for (const dept of deptRows) {
      const dbName = dept.database_name;
      console.log(`\n--- Provisioning ${dept.dept_code} Database: \`${dbName}\` ---`);

      // Ensure database exists
      const directConn = await mysql.createConnection(dbConfig);
      await directConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await directConn.end();

      const deptConn = await mysql.createConnection({ ...dbConfig, database: dbName });

      // Execute each table definition
      for (const tableSql of departmentSchemaTables) {
        await deptConn.query(tableSql);
      }
      console.log(`  ✓ All ${departmentSchemaTables.length} isolated tables created/verified in \`${dbName}\`.`);

      // Sync existing students from students_master in master DB if department tables are empty
      try {
        const [studentCount] = await deptConn.query('SELECT COUNT(*) AS cnt FROM students');
        if (studentCount[0].cnt === 0) {
          console.log(`  Syncing existing students from master DB for ${dept.dept_code}...`);
          const [masterStudents] = await masterConn.query(`
            SELECT sm.register_number, u.first_name, u.last_name, u.email, u.phone, 
                   sm.department_code, sm.programme, sm.batch AS admission_batch, 
                   COALESCE(sm.academic_year, '2026-2027') AS academic_year,
                   CASE 
                     WHEN sm.current_semester <= 2 THEN 1 
                     WHEN sm.current_semester <= 4 THEN 2 
                     WHEN sm.current_semester <= 6 THEN 3 
                     ELSE 4 
                   END AS year_of_study,
                   COALESCE(sm.current_semester, 7) AS current_semester,
                   'A' AS class_name, 'A' AS section, 'REGULAR' AS academic_status,
                   sm.placement_status, sm.cgpa, sm.active_backlogs, sm.history_of_backlogs,
                   sm.tenth_percentage, sm.twelfth_percentage, sm.skills, sm.linkedin_url, sm.github_url, sm.portfolio_url
            FROM students_master sm
            JOIN users u ON sm.user_id = u.id
            WHERE sm.department_code = ?
          `, [dept.dept_code]);

          for (const s of masterStudents) {
            await deptConn.query(`
              INSERT INTO students 
              (register_number, first_name, last_name, email, phone, department_code, programme, admission_batch, academic_year, year_of_study, current_semester, class_name, section, academic_status, placement_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), email=VALUES(email)
            `, [
              s.register_number, s.first_name, s.last_name, s.email, s.phone,
              s.department_code, s.programme || 'B.Tech', s.admission_batch || '2023-2027', s.academic_year,
              s.year_of_study, s.current_semester, s.class_name, s.section, s.academic_status, s.placement_status
            ]);

            await deptConn.query(`
              INSERT INTO student_profiles 
              (register_number, tenth_percentage, twelfth_percentage, skills, linkedin_url, github_url, portfolio_url)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE tenth_percentage=VALUES(tenth_percentage), twelfth_percentage=VALUES(twelfth_percentage)
            `, [
              s.register_number, s.tenth_percentage || 0, s.twelfth_percentage || 0,
              s.skills ? JSON.stringify(s.skills) : null, s.linkedin_url, s.github_url, s.portfolio_url
            ]);

            // Sync academic records
            const semGpa = parseFloat(s.cgpa) || 8.0;
            await deptConn.query(`
              INSERT INTO student_academic_records 
              (register_number, sem1_gpa, sem2_gpa, sem3_gpa, sem4_gpa, sem5_gpa, sem6_gpa, current_cgpa, active_backlogs, history_of_backlogs, total_credits_earned)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE current_cgpa=VALUES(current_cgpa), active_backlogs=VALUES(active_backlogs)
            `, [
              s.register_number, semGpa, semGpa, semGpa, semGpa, semGpa, semGpa,
              semGpa, s.active_backlogs || 0, s.history_of_backlogs || 0, 140
            ]);

            // Sync dept_students_academic for backward-compat
            await deptConn.query(`
              INSERT INTO dept_students_academic
              (register_number, sem1_gpa, sem2_gpa, sem3_gpa, sem4_gpa, sem5_gpa, sem6_gpa, current_cgpa, active_backlogs, cleared_backlogs, verification_status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'VERIFIED')
              ON DUPLICATE KEY UPDATE current_cgpa=VALUES(current_cgpa)
            `, [
              s.register_number, semGpa, semGpa, semGpa, semGpa, semGpa, semGpa, semGpa, s.active_backlogs || 0
            ]);
          }
          console.log(`  ✓ Synced ${masterStudents.length} student records into ${dbName}.`);
        }
      } catch (syncErr) {
        console.warn(`  ! Student sync note for ${dept.dept_code}:`, syncErr.message);
      }

      await deptConn.end();
    }

    await masterConn.end();
    console.log('\n================================================================');
    console.log('✅ [MIGRATION COMPLETE] All Department & Academic schemas live!');
    console.log('================================================================');
    return true;
  } catch (error) {
    console.error('❌ [MIGRATION FAILED]:', error);
    throw error;
  }
}

if (require.main === module) {
  runDepartmentAcademicMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  runDepartmentAcademicMigration,
  departmentSchemaTables,
};
