const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const platformDbName = process.env.DB_PLATFORM_NAME || 'campuscorp_platform';

async function runPlatformSaasMigration() {
  console.log('================================================================');
  console.log('🌐 [MIGRATION] Running Central Platform SaaS Migration');
  console.log('================================================================');

  let rootConn;
  try {
    rootConn = await mysql.createConnection(dbConfig);
    console.log(`✓ Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    // 1. Ensure central platform database exists
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${platformDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ Central Platform database confirmed: \`${platformDbName}\``);
    await rootConn.end();

    const platformConn = await mysql.createConnection({ ...dbConfig, database: platformDbName });

    // 2. Create platform_users table (Platform Super Admin & Support Admins)
    console.log('Creating platform_users table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS platform_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPPORT_ADMIN') DEFAULT 'PLATFORM_SUPER_ADMIN',
        status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_platform_role (role),
        INDEX idx_platform_status (status)
      ) ENGINE=InnoDB
    `);
    console.log('✓ platform_users table confirmed.');

    // 3. Create colleges table (Subscribed Institutions)
    console.log('Creating colleges table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id INT PRIMARY KEY AUTO_INCREMENT,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        code VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        type ENUM('ENGINEERING', 'ARTS_SCIENCE', 'UNIVERSITY', 'POLYTECHNIC', 'AUTONOMOUS') DEFAULT 'ENGINEERING',
        affiliation VARCHAR(150) NULL,
        subdomain VARCHAR(50) NOT NULL UNIQUE,
        contact_email VARCHAR(150) NOT NULL,
        contact_phone VARCHAR(25) NULL,
        address TEXT NULL,
        logo_url VARCHAR(255) NULL,
        status ENUM('PENDING', 'PROVISIONING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_college_status (status),
        INDEX idx_college_code (code),
        INDEX idx_college_subdomain (subdomain)
      ) ENGINE=InnoDB
    `);
    console.log('✓ colleges table confirmed.');

    // 4. Create college_database_registry table
    console.log('Creating college_database_registry table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS college_database_registry (
        id INT PRIMARY KEY AUTO_INCREMENT,
        college_id INT NOT NULL UNIQUE,
        database_name VARCHAR(64) NOT NULL UNIQUE,
        db_host VARCHAR(150) DEFAULT '127.0.0.1',
        db_port INT DEFAULT 3306,
        db_user VARCHAR(100) NOT NULL DEFAULT 'root',
        db_password_encrypted TEXT NULL,
        schema_version VARCHAR(20) DEFAULT '1.0.0',
        is_provisioned BOOLEAN DEFAULT FALSE,
        provisioned_at TIMESTAMP NULL,
        last_health_check TIMESTAMP NULL,
        health_status ENUM('HEALTHY', 'DEGRADED', 'OFFLINE') DEFAULT 'HEALTHY',
        latency_ms INT DEFAULT 0,
        database_size_bytes BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ college_database_registry table confirmed.');

    // 5. Create subscription_plans table
    console.log('Creating subscription_plans table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plan_code VARCHAR(50) NOT NULL UNIQUE,
        plan_name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        max_students INT DEFAULT 1000,
        max_faculty INT DEFAULT 100,
        max_storage_gb INT DEFAULT 50,
        price_per_year DECIMAL(10,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('✓ subscription_plans table confirmed.');

    // 6. Create college_subscriptions table
    console.log('Creating college_subscriptions table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS college_subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        college_id INT NOT NULL,
        plan_id INT NOT NULL,
        start_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status ENUM('TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED') DEFAULT 'ACTIVE',
        custom_student_limit INT NULL,
        custom_storage_limit_gb INT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
      ) ENGINE=InnoDB
    `);
    console.log('✓ college_subscriptions table confirmed.');

    // 7. Create platform_modules table (Master Catalog of System Modules)
    console.log('Creating platform_modules table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS platform_modules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        module_key VARCHAR(50) NOT NULL UNIQUE,
        module_name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        base_route VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('✓ platform_modules table confirmed.');

    // 8. Create college_module_entitlements table
    console.log('Creating college_module_entitlements table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS college_module_entitlements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        college_id INT NOT NULL,
        module_key VARCHAR(50) NOT NULL,
        is_enabled BOOLEAN DEFAULT TRUE,
        feature_flags JSON NULL,
        updated_by_platform_user INT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_college_module (college_id, module_key),
        FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
        FOREIGN KEY (module_key) REFERENCES platform_modules(module_key) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('✓ college_module_entitlements table confirmed.');

    // 9. Create platform_audit_logs table
    console.log('Creating platform_audit_logs table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS platform_audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        platform_user_id INT NULL,
        college_id INT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NULL,
        details JSON NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_platform_audit_college (college_id),
        INDEX idx_platform_audit_time (created_at)
      ) ENGINE=InnoDB
    `);
    console.log('✓ platform_audit_logs table confirmed.');

    // 10. Create platform_settings table (Key-Value Configs)
    console.log('Creating platform_settings table...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
        description VARCHAR(255) NULL,
        is_encrypted BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('✓ platform_settings table confirmed.');

    // =================================================================
    // INITIAL SEED DATA
    // =================================================================

    // Seed 1: Platform Super Admin
    console.log('Checking Platform Super Admin account...');
    const [adminRows] = await platformConn.query("SELECT id FROM platform_users WHERE email = 'platform.admin@campuscorp.io'");
    if (adminRows.length === 0) {
      const hash = await bcrypt.hash('Password@123', 10);
      await platformConn.query(`
        INSERT INTO platform_users (uuid, email, password_hash, first_name, last_name, role, status)
        VALUES ('00000000-0000-0000-0000-000000000001', 'platform.admin@campuscorp.io', ?, 'Platform', 'Owner', 'PLATFORM_SUPER_ADMIN', 'ACTIVE')
      `, [hash]);
      console.log('✓ Created initial Platform Super Admin: platform.admin@campuscorp.io');
    }

    // Seed 2: Subscription Plans
    console.log('Seeding standard subscription plans...');
    const standardPlans = [
      ['STARTER', 'Starter Institutional Plan', 'Basic placement drives and LMS for small departments', 500, 50, 25, 49999.00],
      ['GROWTH', 'Growth Campus Suite', 'Comprehensive recruitment, assessments, and AI resume screening', 2500, 200, 100, 149999.00],
      ['ENTERPRISE', 'Full Autonomous University Plan', 'Unlimited students, full multi-database isolation, WebRTC video, and NIRF analytics', 10000, 1000, 500, 299999.00],
    ];

    for (const [code, name, desc, students, faculty, storage, price] of standardPlans) {
      await platformConn.query(`
        INSERT INTO subscription_plans (plan_code, plan_name, description, max_students, max_faculty, max_storage_gb, price_per_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name), description = VALUES(description), max_students = VALUES(max_students)
      `, [code, name, desc, students, faculty, storage, price]);
    }
    console.log('✓ Subscription plans seeded.');

    // Seed 3: Platform Modules Catalog
    console.log('Seeding platform modules catalog...');
    const standardModules = [
      ['LMS', 'Learning Management System (LMS)', 'Course materials, assignments, quiz builder, and certificates', '/lms', 'ACADEMICS'],
      ['CAREER_EXPLORER', 'IT Career Explorer', '38 IT career domains, role roadmaps, and role comparison engine', '/domains', 'CAREER'],
      ['RECRUITMENT', 'Recruitment & Campus Drives', 'Company management, job openings, drives, and offer letters', '/companies', 'PLACEMENT'],
      ['ASSESSMENTS', 'Coding Assessments & Sandbox', 'In-browser multi-language compiler and proctored examination mode', '/assessment', 'PLACEMENT'],
      ['INTERVIEWS', 'WebRTC Video Interview Suite', 'Real-time peer-to-peer video interviews and room code meetings', '/interviews', 'PLACEMENT'],
      ['RESUME_AI', 'Local AI Resume Analyzer', 'Mistral-7B ATS resume evaluation and skill gap identification', '/resume-analyzer', 'AI_TOOLS'],
      ['SKILL_ANALYZER', 'Industry Skill Analyzer', 'Student skill benchmarking against industry job profiles', '/skill-analyzer', 'CAREER'],
      ['COMPANY_LOCATIONS', 'Tech Companies by Location', 'Geospatial directory of tech companies and hiring hubs', '/career-explorer/companies', 'CAREER'],
      ['GOVERNANCE', 'Institutional Governance & NIRF', 'Placement policies, budget trackers, and NAAC/NIRF reporting', '/policies', 'GOVERNANCE'],
    ];

    for (const [key, name, desc, route, cat] of standardModules) {
      await platformConn.query(`
        INSERT INTO platform_modules (module_key, module_name, description, base_route, category)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE module_name = VALUES(module_name), description = VALUES(description), base_route = VALUES(base_route)
      `, [key, name, desc, route, cat]);
    }
    console.log('✓ Platform modules seeded.');

    // Seed 4: Seed Initial Existing Institution (The current CampusCorp College)
    console.log('Registering existing institution as initial tenant...');
    const [collegeRows] = await platformConn.query("SELECT id FROM colleges WHERE code = 'CAMPUS_MAIN'");
    let mainCollegeId;
    if (collegeRows.length === 0) {
      const [insRes] = await platformConn.query(`
        INSERT INTO colleges (uuid, code, name, type, affiliation, subdomain, contact_email, contact_phone, address, status)
        VALUES ('11111111-1111-1111-1111-111111111111', 'CAMPUS_MAIN', 'CampusCorp Institute of Technology', 'AUTONOMOUS', 'State Technical University', 'main', 'contact@campuscorp.edu', '+91 98765 43210', 'Tech Innovation Campus, Coimbatore, Tamil Nadu', 'ACTIVE')
      `);
      mainCollegeId = insRes.insertId;

      // Register Database (Points to current active database 'lms')
      const targetDb = process.env.DB_COMMON_NAME || 'lms';
      await platformConn.query(`
        INSERT INTO college_database_registry (college_id, database_name, db_host, db_port, db_user, is_provisioned, provisioned_at, health_status, latency_ms)
        VALUES (?, ?, ?, ?, ?, TRUE, NOW(), 'HEALTHY', 2)
      `, [mainCollegeId, targetDb, dbConfig.host, dbConfig.port, dbConfig.user]);

      // Assign Enterprise Subscription
      const [entPlan] = await platformConn.query("SELECT id FROM subscription_plans WHERE plan_code = 'ENTERPRISE'");
      const planId = entPlan[0]?.id || 1;
      await platformConn.query(`
        INSERT INTO college_subscriptions (college_id, plan_id, start_date, expiry_date, status, custom_student_limit, notes)
        VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'ACTIVE', 10000, 'Foundational flagship tenant')
      `, [mainCollegeId, planId]);

      // Enable All Standard Modules for Flagship Tenant
      for (const [key] of standardModules) {
        await platformConn.query(`
          INSERT INTO college_module_entitlements (college_id, module_key, is_enabled)
          VALUES (?, ?, TRUE)
        `, [mainCollegeId, key]);
      }

      console.log(`✓ Initial flagship tenant 'CAMPUS_MAIN' registered with database '${targetDb}' and Enterprise plan.`);
    } else {
      mainCollegeId = collegeRows[0].id;
    }

    // Seed 5: Default Global Platform Settings
    const defaultSettings = [
      ['platform_name', 'CampusCorp Global SaaS Hub', 'GENERAL', 'Public facing platform title'],
      ['support_email', 'support@campuscorp.io', 'GENERAL', 'Primary platform support desk'],
      ['allow_new_registrations', 'true', 'SECURITY', 'Whether colleges can self-register or invite only'],
      ['max_free_trial_days', '30', 'BILLING', 'Default trial period duration in days'],
      ['require_mfa_for_platform_admins', 'false', 'SECURITY', 'Enforce multi-factor authentication for platform admins'],
      ['session_timeout_minutes', '120', 'SECURITY', 'Inactivity session timeout duration'],
      ['default_db_host', dbConfig.host, 'INFRASTRUCTURE', 'Default database cluster host for new tenants'],
      ['default_db_port', String(dbConfig.port), 'INFRASTRUCTURE', 'Default database cluster port for new tenants'],
    ];

    for (const [sKey, sVal, sCat, sDesc] of defaultSettings) {
      await platformConn.query(`
        INSERT INTO platform_settings (setting_key, setting_value, category, description)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE description = VALUES(description)
      `, [sKey, sVal, sCat, sDesc]);
    }
    console.log('✓ Platform settings initialized.');

    await platformConn.end();
    console.log('================================================================');
    console.log('🎉 [MIGRATION COMPLETE] Central Platform Database Ready!');
    console.log('================================================================');
    return true;
  } catch (err) {
    console.error('❌ [MIGRATION FAILED]:', err);
    throw err;
  }
}

if (require.main === module) {
  runPlatformSaasMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runPlatformSaasMigration, platformDbName };

