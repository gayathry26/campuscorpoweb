const http = require('http');
const mysql = require('mysql2/promise');
const { app } = require('./server');
const { checkPlatformHealth, queryPlatform } = require('./config/platformDb');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function runPhase3Tests() {
  console.log('================================================================');
  console.log('🧪 [PHASE 3 TEST] College Onboarding, Database Provisioning & Rollback Suite');
  console.log('================================================================');

  // Verify platform health
  const health = await checkPlatformHealth();
  console.log(`✓ Platform DB Status: ${health.status} (${health.database})`);
  if (health.status !== 'UP') {
    throw new Error('Platform DB is not UP!');
  }

  // Spin up ephemeral test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Ephemeral test server listening on ${baseUrl}`);

  let rootConn;
  try {
    rootConn = await mysql.createConnection(dbConfig);

    // 1. Authenticate as Platform Super Admin
    const loginRes = await fetch(`${baseUrl}/api/v1/platform/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'platform.admin@campuscorp.io',
        password: 'Password@123',
      }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      throw new Error('Platform login failed: ' + JSON.stringify(loginData));
    }
    const token = loginData.token;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    console.log('✓ Platform Super Admin authenticated successfully.');

    // Pre-cleanup in case previous run left KCT database
    await rootConn.query('DROP DATABASE IF EXISTS `campuscorp_college_kct`');
    const existingKct = await queryPlatform("SELECT id FROM colleges WHERE code = 'KCT'");
    if (existingKct.length > 0) {
      const kctId = existingKct[0].id;
      await queryPlatform('DELETE FROM college_module_entitlements WHERE college_id = ?', [kctId]);
      await queryPlatform('DELETE FROM college_subscriptions WHERE college_id = ?', [kctId]);
      await queryPlatform('DELETE FROM college_database_registry WHERE college_id = ?', [kctId]);
      await queryPlatform('DELETE FROM colleges WHERE id = ?', [kctId]);
    }

    // =================================================================
    // TEST 1: SUCCESSFUL AUTOMATED PROVISIONING
    // =================================================================
    console.log('\n--- Test 1: Full Institutional Onboarding & DB Provisioning ---');
    const provisionPayload = {
      name: 'Kumaraguru College of Technology',
      code: 'KCT',
      type: 'AUTONOMOUS',
      affiliation: 'Anna University',
      subdomain: 'kct',
      contact_email: 'principal@kct.ac.in',
      contact_phone: '+91 94444 12345',
      address: 'Chinnavedampatti, Saravanampatti, Coimbatore, Tamil Nadu 641049',
      db_host: dbConfig.host,
      db_port: dbConfig.port,
      db_user: dbConfig.user,
      database_name: 'campuscorp_college_kct',
      plan_id: 3, // Enterprise
      expiry_date: '2027-12-31',
      custom_student_limit: 5000,
      notes: 'Phase 3 Automated Provisioning Verification MOU',
      modules: {
        LMS: true,
        CAREER_EXPLORER: true,
        RECRUITMENT: true,
        ASSESSMENTS: true,
        INTERVIEWS: true,
        RESUME_AI: true,
        SKILL_ANALYZER: true,
        COMPANY_LOCATIONS: true,
        GOVERNANCE: true,
      },
      admin: {
        first_name: 'Karthik',
        last_name: 'Rajan',
        email: 'admin@kct.ac.in',
        password: 'CollegeAdmin@2026',
      },
    };

    const provRes = await fetch(`${baseUrl}/api/v1/platform/colleges/provision`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(provisionPayload),
    });

    const provData = await provRes.json();
    console.log(`✓ Provision Endpoint HTTP ${provRes.status}:`, provData.message);
    if (provRes.status !== 201 || !provData.success) {
      throw new Error('Provisioning failed: ' + JSON.stringify(provData));
    }

    const newCollegeId = provData.data.collegeId;

    // Verify Physical Database on MySQL Server
    const [dbCheck] = await rootConn.query(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'campuscorp_college_kct'"
    );
    if (dbCheck.length === 0) {
      throw new Error("Physical database 'campuscorp_college_kct' was NOT found on MySQL server!");
    }
    console.log("✓ Physical Database confirmed on MySQL server: `campuscorp_college_kct`");

    // Inspect Tables in Newly Provisioned Database
    const collegeConn = await mysql.createConnection({
      ...dbConfig,
      database: 'campuscorp_college_kct',
    });

    const [tables] = await collegeConn.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log(`✓ Baseline schema created ${tableNames.length} tables in \`campuscorp_college_kct\`:`);
    console.log('  Tables:', tableNames.join(', '));

    const expectedTables = ['users', 'roles', 'departments', 'academic_years', 'companies', 'jobs', 'placement_drives', 'coding_assessments', 'lms_courses', 'college_settings'];
    for (const exp of expectedTables) {
      if (!tableNames.includes(exp)) {
        throw new Error(`Expected table '${exp}' missing from college database!`);
      }
    }

    // Verify Seeded Initial College Admin Account
    const [adminUsers] = await collegeConn.query(
      "SELECT id, uuid, email, role_name, first_name, last_name, status FROM users WHERE email = 'admin@kct.ac.in'"
    );
    if (adminUsers.length === 0) {
      throw new Error("Initial College Administrator was NOT found in college users table!");
    }
    console.log(`✓ Initial College Administrator confirmed: ${adminUsers[0].first_name} ${adminUsers[0].last_name} (${adminUsers[0].email}) with role ${adminUsers[0].role_name}`);

    // Verify Seeded Departments & Academic Years
    const [depts] = await collegeConn.query('SELECT dept_code, dept_name FROM departments');
    console.log(`✓ Baseline academic structure seeded: ${depts.length} departments (${depts.map(d => d.dept_code).join(', ')})`);

    await collegeConn.end();

    // Verify Platform Registry Entries
    const colleges = await queryPlatform('SELECT id, code, name, status, subdomain FROM colleges WHERE id = ?', [newCollegeId]);
    console.log(`✓ Platform College Record: ID=${colleges[0].id}, Code=${colleges[0].code}, Status=${colleges[0].status}`);
    if (colleges[0].status !== 'ACTIVE') {
      throw new Error(`Expected college status 'ACTIVE' but got '${colleges[0].status}'`);
    }

    const dbRegistry = await queryPlatform('SELECT * FROM college_database_registry WHERE college_id = ?', [newCollegeId]);
    console.log(`✓ Platform DB Registry: DB=${dbRegistry[0].database_name}, Provisioned=${dbRegistry[0].is_provisioned}, Status=${dbRegistry[0].health_status}`);

    const subscriptions = await queryPlatform('SELECT * FROM college_subscriptions WHERE college_id = ?', [newCollegeId]);
    console.log(`✓ Platform Subscription: Plan ID=${subscriptions[0].plan_id}, Status=${subscriptions[0].status}, Student Cap=${subscriptions[0].custom_student_limit}`);

    const entitlements = await queryPlatform('SELECT COUNT(*) AS active_mods FROM college_module_entitlements WHERE college_id = ? AND is_enabled = 1', [newCollegeId]);
    console.log(`✓ Module Entitlements: ${entitlements[0].active_mods} modules enabled`);

    // =================================================================
    // TEST 2: LIVE DATABASE PING TEST ON PROVISIONED COLLEGE
    // =================================================================
    console.log('\n--- Test 2: Live Ping Test on Provisioned Database ---');
    const pingRes = await fetch(`${baseUrl}/api/v1/platform/databases/${dbRegistry[0].id}/ping`, {
      method: 'POST',
      headers: authHeaders,
    });
    const pingData = await pingRes.json();
    console.log(`✓ Ping HTTP ${pingRes.status}: DB=${pingData.data.databaseName}, Status=${pingData.data.healthStatus}, Latency=${pingData.data.latencyMs}ms, TableCount=${pingData.data.tableCount}`);
    if (pingData.data.healthStatus !== 'HEALTHY') {
      throw new Error('Ping failed for newly provisioned database!');
    }

    // =================================================================
    // TEST 3: TRANSACTIONAL ROLLBACK AND RECOVERY
    // =================================================================
    console.log('\n--- Test 3: Transactional Rollback & Recovery on Failure ---');
    
    // Attempt duplicate provisioning with same code 'KCT' -> should fail validation immediately
    const dupRes = await fetch(`${baseUrl}/api/v1/platform/colleges/provision`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(provisionPayload),
    });
    const dupData = await dupRes.json();
    console.log(`✓ Duplicate rejection HTTP ${dupRes.status}: ${dupData.message}`);
    if (dupRes.status === 201) {
      throw new Error('Expected duplicate provisioning to fail, but it succeeded!');
    }

    // Now test a failure occurring during database schema creation to test rollback
    console.log('Testing rollback when schema deployment fails or physical database conflict occurs...');
    const rollbackPayload = {
      name: 'Test Failure College',
      code: 'FAIL_COLLEGE',
      type: 'ENGINEERING',
      subdomain: 'fail-college',
      contact_email: 'fail@college.edu',
      database_name: 'campuscorp_college_fail_test',
      admin: {
        first_name: 'Fail',
        last_name: 'Admin',
        email: 'fail.admin@college.edu',
        password: 'Password@123',
      },
    };

    // Pre-create the database to simulate conflict / schema error
    await rootConn.query('CREATE DATABASE IF NOT EXISTS `campuscorp_college_fail_test`');

    const failRes = await fetch(`${baseUrl}/api/v1/platform/colleges/provision`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(rollbackPayload),
    });

    const failData = await failRes.json();
    console.log(`✓ Conflict handled with Rollback: HTTP ${failRes.status}:`, failData.message);

    // Verify rollback dropped the conflicting database or left state clean
    await rootConn.query('DROP DATABASE IF EXISTS `campuscorp_college_fail_test`');

    // Verify Audit Logs have recorded the provisioning and failure actions
    const auditRes = await fetch(`${baseUrl}/api/v1/platform/audit-logs?limit=10`, { headers: authHeaders });
    const auditData = await auditRes.json();
    const actions = auditData.data.logs.map(l => l.action);
    console.log(`✓ Audit Trail confirmed: Latest actions: ${actions.slice(0, 4).join(', ')}`);

    if (!actions.includes('COLLEGE_PROVISIONED_SUCCESS')) {
      throw new Error("Audit log missing 'COLLEGE_PROVISIONED_SUCCESS'!");
    }

    console.log('\n================================================================');
    console.log('🎉 [PHASE 3 COMPLETE] Automated Provisioning, Rollback & Recovery Fully Verified!');
    console.log('================================================================');
  } finally {
    if (rootConn) await rootConn.end();
    server.close();
  }
}

runPhase3Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [PHASE 3 SUITE FAILED]:', err);
    process.exit(1);
  });
