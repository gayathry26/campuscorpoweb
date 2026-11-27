const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Execute baseline schema DDL and seeding on a newly created college database
 * @param {mysql.Connection} conn - Active connection to the new college database
 * @param {object} college - { name, code, type, subdomain, contact_email }
 * @param {object} admin - { first_name, last_name, email, password }
 */
async function deployCollegeBaselineSchema(conn, college, admin) {
  // 1. Roles Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      role_name VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255)
    ) ENGINE=InnoDB
  `);

  // Seed default roles
  const roles = [
    [1, 'SUPER_ADMIN', 'Institutional Super Administrator with full college control'],
    [2, 'ADMIN', 'Institutional Administrator / Principal'],
    [3, 'STUDENT', 'Enrolled College Student'],
    [4, 'PLACEMENT_OFFICER', 'Training & Placement Office Staff'],
    [5, 'FACULTY', 'Academic Department Faculty & Mentor'],
    [6, 'STAFF', 'Department Administrative Staff'],
    [7, 'COMPANY', 'Corporate Recruiter'],
  ];

  for (const [id, rname, rdesc] of roles) {
    await conn.query(`
      INSERT INTO roles (id, role_name, description)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `, [id, rname, rdesc]);
  }

  // 2. Users Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role_id INT NOT NULL,
      role_name VARCHAR(50) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      department_code VARCHAR(20),
      status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
      avatar_url VARCHAR(255),
      sessions_revoked_before TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_role (role_name),
      INDEX idx_dept (department_code)
    ) ENGINE=InnoDB
  `);

  // 3. Departments Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      dept_code VARCHAR(20) NOT NULL UNIQUE,
      dept_name VARCHAR(100) NOT NULL,
      hod_name VARCHAR(100) NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // Seed standard engineering/college departments
  const standardDepts = [
    ['CSE', 'Computer Science and Engineering'],
    ['ECE', 'Electronics and Communication Engineering'],
    ['EEE', 'Electrical and Electronics Engineering'],
    ['MECH', 'Mechanical Engineering'],
    ['CIVIL', 'Civil Engineering'],
    ['IT', 'Information Technology'],
  ];

  for (const [dcode, dname] of standardDepts) {
    await conn.query(`
      INSERT INTO departments (dept_code, dept_name)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name)
    `, [dcode, dname]);
  }

  // 4. Academic Years Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS academic_years (
      id INT PRIMARY KEY AUTO_INCREMENT,
      year_code VARCHAR(20) NOT NULL UNIQUE,
      is_current BOOLEAN DEFAULT FALSE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    INSERT INTO academic_years (year_code, is_current, start_date, end_date)
    VALUES ('2025-2026', FALSE, '2025-06-01', '2026-05-31'),
           ('2026-2027', TRUE, '2026-06-01', '2027-05-31')
    ON DUPLICATE KEY UPDATE is_current = VALUES(is_current)
  `);

  // 5. Students Master Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS students_master (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL UNIQUE,
      register_number VARCHAR(50) NOT NULL UNIQUE,
      roll_number VARCHAR(50),
      department_code VARCHAR(20) NOT NULL,
      programme VARCHAR(50) DEFAULT 'B.Tech',
      batch VARCHAR(20) DEFAULT '2023-2027',
      graduation_year INT DEFAULT 2027,
      academic_year VARCHAR(20) DEFAULT '2026-2027',
      current_semester INT DEFAULT 7,
      cgpa DECIMAL(4,2) DEFAULT 0.00,
      active_backlogs INT DEFAULT 0,
      history_of_backlogs INT DEFAULT 0,
      tenth_percentage DECIMAL(5,2) DEFAULT 0.00,
      twelfth_percentage DECIMAL(5,2) DEFAULT 0.00,
      placement_status ENUM('NOT_REGISTERED', 'REGISTERED', 'OPTED_OUT', 'PLACED', 'MULTIPLE_OFFERS') DEFAULT 'REGISTERED',
      placement_readiness_score INT DEFAULT 75,
      skills JSON,
      linkedin_url VARCHAR(255),
      github_url VARCHAR(255),
      portfolio_url VARCHAR(255),
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_dept_cgpa (department_code, cgpa),
      INDEX idx_placement_status (placement_status)
    ) ENGINE=InnoDB
  `);

  // 6. Companies Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      name VARCHAR(150) NOT NULL UNIQUE,
      industry VARCHAR(100) NOT NULL,
      website VARCHAR(255),
      headquarters VARCHAR(150),
      contact_email VARCHAR(150),
      contact_phone VARCHAR(20),
      tier ENUM('DREAM', 'SUPER_DREAM', 'REGULAR', 'MASS_RECRUITER') DEFAULT 'REGULAR',
      status ENUM('PROSPECT', 'VERIFIED', 'ACTIVE', 'INACTIVE', 'BLACKLISTED') DEFAULT 'ACTIVE',
      rating DECIMAL(3,2) DEFAULT 4.5,
      logo_url VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tier (tier),
      INDEX idx_status (status)
    ) ENGINE=InnoDB
  `);

  // 7. Jobs Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      company_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      role_type ENUM('FULL_TIME', 'INTERNSHIP', 'INTERN_TO_FTE') DEFAULT 'FULL_TIME',
      job_description TEXT NOT NULL,
      eligibility_criteria JSON,
      min_cgpa DECIMAL(4,2) DEFAULT 6.00,
      max_backlogs INT DEFAULT 0,
      ctc_lpa DECIMAL(6,2) NOT NULL,
      stipend_monthly DECIMAL(10,2) DEFAULT 0.00,
      locations VARCHAR(255) DEFAULT 'Pan-India',
      vacancies INT DEFAULT 5,
      deadline_date DATETIME NOT NULL,
      status ENUM('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'CLOSED', 'CANCELLED') DEFAULT 'PUBLISHED',
      approved_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      INDEX idx_ctc (ctc_lpa),
      INDEX idx_status (status)
    ) ENGINE=InnoDB
  `);

  // 8. Placement Drives Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS placement_drives (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      job_id INT NOT NULL,
      drive_title VARCHAR(150) NOT NULL,
      drive_type ENUM('ON_CAMPUS', 'POOLED', 'OFF_CAMPUS', 'VIRTUAL', 'HYBRID') DEFAULT 'ON_CAMPUS',
      drive_date DATE NOT NULL,
      venue VARCHAR(150) DEFAULT 'Main Campus Placement Block',
      current_stage VARCHAR(100) DEFAULT 'Online Assessment',
      total_rounds INT DEFAULT 4,
      coordinator_id INT,
      status ENUM('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'POSTPONED', 'CANCELLED') DEFAULT 'UPCOMING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // 9. Job Applications Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      job_id INT NOT NULL,
      student_id INT NOT NULL,
      register_number VARCHAR(50) NOT NULL,
      department_code VARCHAR(20) NOT NULL,
      resume_version_url VARCHAR(255),
      current_round_number INT DEFAULT 1,
      status ENUM('APPLIED', 'SHORTLISTED', 'IN_PROCESS', 'REJECTED', 'OFFERED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN') DEFAULT 'APPLIED',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students_master(id) ON DELETE CASCADE,
      UNIQUE KEY uq_job_student (job_id, student_id),
      INDEX idx_app_status (status)
    ) ENGINE=InnoDB
  `);

  // 10. Placement Offers Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS placement_offers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      application_id INT NOT NULL UNIQUE,
      job_id INT NOT NULL,
      student_id INT NOT NULL,
      register_number VARCHAR(50) NOT NULL,
      department_code VARCHAR(20) NOT NULL,
      offered_ctc_lpa DECIMAL(6,2) NOT NULL,
      offer_letter_url VARCHAR(255),
      issue_date DATE NOT NULL,
      status ENUM('OFFERED', 'ACCEPTED', 'REJECTED', 'REVOKED', 'JOINED', 'NOT_JOINED') DEFAULT 'OFFERED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students_master(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // 11. Coding Assessments & Submissions
  await conn.query(`
    CREATE TABLE IF NOT EXISTS coding_assessments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      duration_minutes INT DEFAULT 60,
      total_score INT DEFAULT 100,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      assessment_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      difficulty ENUM('EASY', 'MEDIUM', 'HARD') DEFAULT 'MEDIUM',
      problem_statement TEXT NOT NULL,
      points INT DEFAULT 20,
      sample_test_cases JSON,
      hidden_test_cases JSON,
      FOREIGN KEY (assessment_id) REFERENCES coding_assessments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // 12. LMS Core Tables
  await conn.query(`
    CREATE TABLE IF NOT EXISTS lms_courses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      course_code VARCHAR(30) NOT NULL UNIQUE,
      course_title VARCHAR(150) NOT NULL,
      department_code VARCHAR(20) NOT NULL,
      semester INT NOT NULL DEFAULT 1,
      credits INT DEFAULT 3,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // 13. Institutional Settings Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS college_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      description VARCHAR(255) NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // Seed settings
  const settings = [
    ['college_name', college.name, 'Official registered institution name'],
    ['college_code', college.code, 'Official institutional identifier code'],
    ['subdomain', college.subdomain, 'Institutional SaaS subdomain'],
    ['contact_email', college.contact_email, 'Primary college contact email'],
    ['academic_year_current', '2026-2027', 'Active academic year'],
    ['placement_policy_max_offers', '2', 'Maximum placement offers permitted per student'],
  ];

  for (const [k, v, desc] of settings) {
    await conn.query(`
      INSERT INTO college_settings (setting_key, setting_value, description)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `, [k, v, desc]);
  }

  // 14. Role Permissions Table (Institutional RBAC Isolation)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_name VARCHAR(50) PRIMARY KEY,
      allowed_pages JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // 15. Seed Initial College Super Administrator
  const adminUuid = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(admin.password, 10);

  await conn.query(`
    INSERT INTO users (uuid, email, password_hash, role_id, role_name, first_name, last_name, status)
    VALUES (?, ?, ?, 1, 'SUPER_ADMIN', ?, ?, 'ACTIVE')
  `, [adminUuid, admin.email.toLowerCase().trim(), hashedPassword, admin.first_name, admin.last_name]);

  console.log(`✓ Seeded initial College Super Admin '${admin.email}' in ${college.code} database.`);
  return true;
}

module.exports = { deployCollegeBaselineSchema };

