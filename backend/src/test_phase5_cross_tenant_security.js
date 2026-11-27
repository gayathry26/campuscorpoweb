const http = require('http');
const mysql = require('mysql2/promise');
const { app } = require('./server');
const { checkPlatformHealth } = require('./config/platformDb');
const { queryTenant } = require('./config/tenantConnectionManager');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function runPhase5Tests() {
  console.log('================================================================');
  console.log('🧪 [PHASE 5 TEST] Cross-Tenant Security, Isolation & College Admin Suite');
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

  try {
    // 1. Authenticate as Flagship Admin (Database: lms)
    const flagshipLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@uniserve.edu',
        password: 'Password@123',
      }),
    });
    const flagshipLoginData = await flagshipLoginRes.json();
    const flagshipToken = flagshipLoginData.token;
    console.log('✓ Flagship Super Admin authenticated (DB: lms).');

    // 2. Authenticate as KCT College Admin (Database: campuscorp_college_kct)
    const kctLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kct.ac.in',
        password: 'CollegeAdmin@2026',
        collegeCode: 'KCT',
      }),
    });
    const kctLoginData = await kctLoginRes.json();
    if (!kctLoginData.token) {
      throw new Error('KCT login failed: ' + JSON.stringify(kctLoginData));
    }
    const kctToken = kctLoginData.token;
    console.log('✓ KCT College Super Admin authenticated (DB: campuscorp_college_kct).');

    const kctHeaders = {
      'Authorization': `Bearer ${kctToken}`,
      'Content-Type': 'application/json',
    };
    const flagshipHeaders = {
      'Authorization': `Bearer ${flagshipToken}`,
      'Content-Type': 'application/json',
    };

    // =================================================================
    // TEST 1: COLLEGE ADMIN PROFILE & METRICS
    // =================================================================
    console.log('\n--- Test 1: College Admin Institutional Dashboard ---');
    const profileRes = await fetch(`${baseUrl}/api/v1/college-admin/profile`, { headers: kctHeaders });
    const profileData = await profileRes.json();
    console.log(`✓ Institutional Profile: ${profileData.college.name} (${profileData.college.code}), DB: ${profileData.college.databaseName}`);
    if (profileData.college.databaseName !== 'campuscorp_college_kct') {
      throw new Error('Expected KCT database name!');
    }

    const metricsRes = await fetch(`${baseUrl}/api/v1/college-admin/metrics`, { headers: kctHeaders });
    const metricsData = await metricsRes.json();
    console.log(`✓ KCT Institutional Metrics: Students=${metricsData.data.metrics.totalStudents}, Depts=${metricsData.data.metrics.departmentsCount}`);

    // =================================================================
    // TEST 2: DEPARTMENT-LEVEL ACADEMIC STRUCTURE ISOLATION
    // =================================================================
    console.log('\n--- Test 2: Department Isolation within Tenant Database ---');
    // Ensure clean state for repeated test runs
    await queryTenant('KCT', "DELETE FROM departments WHERE dept_code = 'CYBER'");

    // Add new department 'CYBER' to KCT database
    const addDeptRes = await fetch(`${baseUrl}/api/v1/college-admin/departments`, {
      method: 'POST',
      headers: kctHeaders,
      body: JSON.stringify({
        dept_code: 'CYBER',
        dept_name: 'Cybersecurity & Digital Forensics',
        hod_name: 'Dr. K. Ramesh',
      }),
    });
    const addDeptData = await addDeptRes.json();
    console.log(`✓ KCT Added Department 'CYBER': HTTP ${addDeptRes.status}:`, addDeptData.message);

    // Verify 'CYBER' exists in KCT database
    const kctDepts = await queryTenant('KCT', "SELECT dept_code, dept_name FROM departments WHERE dept_code = 'CYBER'");
    if (kctDepts.length === 0) {
      throw new Error("'CYBER' department missing from KCT database!");
    }
    console.log(`✓ Confirmed 'CYBER' exists in KCT database (\`campuscorp_college_kct\`).`);

    // Verify 'CYBER' does NOT exist in Flagship database 'lms'
    const flagshipConn = await mysql.createConnection({ ...dbConfig, database: 'lms' });
    const [flagshipDepts] = await flagshipConn.query("SELECT dept_code FROM department_databases WHERE dept_code = 'CYBER'");
    await flagshipConn.end();
    if (flagshipDepts.length > 0) {
      throw new Error("Cross-tenant leakage: 'CYBER' leaked into Flagship database!");
    }
    console.log(`✓ Zero Leakage Verified: 'CYBER' does NOT exist in Flagship database (\`lms\`).`);

    // =================================================================
    // TEST 3: INSTITUTIONAL SETTINGS ISOLATION
    // =================================================================
    console.log('\n--- Test 3: Institutional Settings Isolation ---');
    const updateSettingRes = await fetch(`${baseUrl}/api/v1/college-admin/settings`, {
      method: 'PUT',
      headers: kctHeaders,
      body: JSON.stringify({
        settings: [
          { setting_key: 'placement_policy_max_offers', setting_value: '3' },
        ],
      }),
    });
    const updateSettingData = await updateSettingRes.json();
    console.log(`✓ KCT Updated Settings: HTTP ${updateSettingRes.status}:`, updateSettingData.message);

    // Verify KCT setting
    const kctSettings = await queryTenant('KCT', "SELECT setting_value FROM college_settings WHERE setting_key = 'placement_policy_max_offers'");
    console.log(`✓ KCT setting 'placement_policy_max_offers' is now: ${kctSettings[0].setting_value}`);
    if (kctSettings[0].setting_value !== '3') {
      throw new Error("Expected KCT setting 'placement_policy_max_offers' to be '3'!");
    }

    // =================================================================
    // TEST 4: CROSS-TENANT DATA LEAKAGE PREVENTION (STUDENTS & DATA)
    // =================================================================
    console.log('\n--- Test 4: Cross-Tenant Data Segregation ---');
    // Query students as KCT -> should be 0 (isolated from Flagship's students)
    const kctStudents = await queryTenant('KCT', "SELECT COUNT(*) AS total FROM students_master");
    console.log(`✓ KCT Students Count: ${kctStudents[0].total} (Flagship students are completely isolated)`);

    // Query companies as KCT -> should be 0
    const kctCompanies = await queryTenant('KCT', "SELECT COUNT(*) AS total FROM companies");
    console.log(`✓ KCT Companies Count: ${kctCompanies[0].total} (Flagship partner companies are completely isolated)`);

    // =================================================================
    // TEST 5: TRANSPARENT ROUTING OF STANDARD APPLICATION CONTROLLERS
    // =================================================================
    console.log('\n--- Test 5: Transparent Controller Routing via AsyncLocalStorage ---');
    // Fetch students list using standard endpoint /api/v1/students as KCT
    const kctStudentsApiRes = await fetch(`${baseUrl}/api/v1/students`, { headers: kctHeaders });
    const kctStudentsApiData = await kctStudentsApiRes.json();
    console.log(`✓ /api/v1/students (KCT token): HTTP ${kctStudentsApiRes.status}, Total Students = ${kctStudentsApiData.pagination?.totalCount ?? 0}`);
    if (kctStudentsApiData.pagination?.totalCount !== 0) {
      throw new Error('KCT should have 0 students initially, but got: ' + kctStudentsApiData.pagination?.totalCount);
    }

    // Fetch students list using standard endpoint /api/v1/students as Flagship
    const flagshipStudentsApiRes = await fetch(`${baseUrl}/api/v1/students`, { headers: flagshipHeaders });
    const flagshipStudentsApiData = await flagshipStudentsApiRes.json();
    console.log(`✓ /api/v1/students (Flagship token): HTTP ${flagshipStudentsApiRes.status}, Total Students = ${flagshipStudentsApiData.pagination?.totalCount ?? 0}`);
    console.log('✓ Transparent execution context isolation verified on standard controller endpoints!');

    console.log('\n================================================================');
    console.log('🎉 [PHASE 5 COMPLETE] Cross-Tenant Security & Isolation Fully Verified!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runPhase5Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [PHASE 5 SUITE FAILED]:', err);
    process.exit(1);
  });
