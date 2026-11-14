const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function seedDemoTenants() {
  console.log('================================================================');
  console.log('🏛️ [SEED] Registering Multi-Tenant Institutions in SaaS Hub');
  console.log('================================================================');

  let platformConn;
  let lmsConn;

  try {
    platformConn = await mysql.createConnection({ ...dbConfig, database: 'campuscorp_platform' });
    lmsConn = await mysql.createConnection({ ...dbConfig, database: 'lms' });

    // 1. Seed Tenants in campuscorp_platform
    const demoColleges = [
      {
        code: 'CAMPUS_MAIN',
        name: 'CampusCorp Flagship Institution',
        type: 'AUTONOMOUS',
        affiliation: 'CampusCorp Educational Consortium',
        subdomain: 'main',
        contact_email: 'admin@college.edu',
      },
      {
        code: 'ABC',
        name: 'ABC Institute of Technology',
        type: 'ENGINEERING',
        affiliation: 'Autonomous Institutional Campus',
        subdomain: 'abc',
        contact_email: 'admin@abc.edu',
      },
      {
        code: 'XYZ',
        name: 'XYZ Engineering College',
        type: 'ENGINEERING',
        affiliation: 'Autonomous Institutional Campus',
        subdomain: 'xyz',
        contact_email: 'admin@xyz.edu',
      },
      {
        code: 'KCT',
        name: 'Kumaraguru College of Technology',
        type: 'ENGINEERING',
        affiliation: 'Anna University Affiliated',
        subdomain: 'kct',
        contact_email: 'admin@kct.ac.in',
      },
    ];

    // Drop UNIQUE constraint on database_name in college_database_registry to allow shared/demo tenant mappings
    try {
      await platformConn.query('ALTER TABLE college_database_registry DROP INDEX database_name');
      console.log('✓ Dropped unique constraint on database_name in college_database_registry');
    } catch (e) {
      // already dropped
    }

    for (const college of demoColleges) {
      await platformConn.query(`
        INSERT INTO colleges (uuid, code, name, type, affiliation, subdomain, contact_email, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          type = VALUES(type),
          affiliation = VALUES(affiliation),
          contact_email = VALUES(contact_email),
          status = 'ACTIVE'
      `, [uuidv4(), college.code, college.name, college.type, college.affiliation, college.subdomain, college.contact_email]);

      const [cRows] = await platformConn.query('SELECT id FROM colleges WHERE code = ?', [college.code]);
      const collegeId = cRows[0].id;

      // Link database registry to 'lms'
      await platformConn.query(`
        INSERT INTO college_database_registry (college_id, database_name, db_host, db_port, db_user, is_provisioned, health_status)
        VALUES (?, 'lms', '127.0.0.1', 3306, 'root', 1, 'HEALTHY')
        ON DUPLICATE KEY UPDATE
          database_name = 'lms',
          is_provisioned = 1,
          health_status = 'HEALTHY'
      `, [collegeId]);

      console.log(`✓ Provisioned SaaS Tenant: ${college.code} (${college.name}) -> DB: lms`);
    }

    // 2. Seed Users in LMS database for demo tenants
    const passwordHash = await bcrypt.hash('Password@123', 10);

    const demoUsers = [
      // ABC
      { email: 'admin@abc.edu', role_id: 1, role_name: 'ADMIN', first_name: 'ABC', last_name: 'Admin', dept: 'CSE' },
      { email: 'faculty@abc.edu', role_id: 4, role_name: 'FACULTY_COORDINATOR', first_name: 'ABC', last_name: 'Faculty', dept: 'CSE' },
      { email: 'student@abc.edu', role_id: 3, role_name: 'STUDENT', first_name: 'ABC', last_name: 'Student', dept: 'CSE', reg_no: 'ABC2026CS01' },

      // XYZ
      { email: 'admin@xyz.edu', role_id: 1, role_name: 'ADMIN', first_name: 'XYZ', last_name: 'Admin', dept: 'ECE' },
      { email: 'faculty@xyz.edu', role_id: 4, role_name: 'FACULTY_COORDINATOR', first_name: 'XYZ', last_name: 'Faculty', dept: 'ECE' },
      { email: 'student@xyz.edu', role_id: 3, role_name: 'STUDENT', first_name: 'XYZ', last_name: 'Student', dept: 'ECE', reg_no: 'XYZ2026EC01' },

      // KCT
      { email: 'admin@kct.ac.in', role_id: 1, role_name: 'ADMIN', first_name: 'KCT', last_name: 'Admin', dept: 'IT' },
      { email: 'student.test@kct.ac.in', role_id: 3, role_name: 'STUDENT', first_name: 'KCT', last_name: 'Student', dept: 'IT', reg_no: 'KCT2026IT01' },
    ];

    for (const u of demoUsers) {
      await lmsConn.query(`
        INSERT INTO users (uuid, email, password_hash, role_id, role_name, first_name, last_name, department_code, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        ON DUPLICATE KEY UPDATE
          password_hash = VALUES(password_hash),
          role_id = VALUES(role_id),
          role_name = VALUES(role_name),
          status = 'ACTIVE'
      `, [uuidv4(), u.email, passwordHash, u.role_id, u.role_name, u.first_name, u.last_name, u.dept]);

      // If student, link student master
      if (u.role_name === 'STUDENT' && u.reg_no) {
        const [userRows] = await lmsConn.query('SELECT id FROM users WHERE email = ?', [u.email]);
        if (userRows.length > 0) {
          const userId = userRows[0].id;
          await lmsConn.query(`
            INSERT INTO students_master (user_id, register_number, roll_number, department_code, programme, current_semester, batch, graduation_year, cgpa, placement_status)
            VALUES (?, ?, ?, ?, 'B.Tech', 7, '2022-2026', 2026, 8.50, 'NOT_PLACED')
            ON DUPLICATE KEY UPDATE
              department_code = VALUES(department_code),
              programme = VALUES(programme),
              cgpa = VALUES(cgpa)
          `, [userId, u.reg_no, u.reg_no, u.dept]);
        }
      }

      console.log(`✓ Provisioned User: ${u.email} [${u.role_name}]`);
    }

    // Ensure user_preferences table has rows for these new users
    await lmsConn.query(`
      INSERT IGNORE INTO user_preferences (user_id, theme_mode, notifications_enabled, lms_alerts_enabled, placement_alerts_enabled)
      SELECT id, 'light', 1, 1, 1 FROM users;
    `);

    console.log('================================================================');
    console.log('✅ [COMPLETE] All Demo Tenants and Users Registered in SaaS Hub');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ [ERROR SEEDING TENANTS]:', err);
    throw err;
  } finally {
    if (platformConn) await platformConn.end();
    if (lmsConn) await lmsConn.end();
  }
}

if (require.main === module) {
  seedDemoTenants()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDemoTenants };
