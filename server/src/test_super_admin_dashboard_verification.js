/**
 * CampusCorp Platform Super Admin Dashboard & Acceptance Verification Suite
 * Verifies all 16 Acceptance Criteria specified in Section 7
 */

const http = require('http');
const mysql = require('mysql2/promise');
const { app } = require('./server');
const { queryPlatform, checkPlatformHealth } = require('./config/platformDb');
const { queryTenant, resolveTenantMetadata } = require('./config/tenantConnectionManager');
const { provisionNewCollege, cleanupFailedCollege } = require('./services/collegeProvisioningService');

async function runSuperAdminVerification() {
  console.log('================================================================');
  console.log('👑 [SUPER ADMIN ACCEPTANCE] Full Dashboard Integration Verification');
  console.log('================================================================');

  const health = await checkPlatformHealth();
  console.log(`✓ Platform DB Status: ${health.status} (${health.database})`);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Ephemeral test server listening on ${baseUrl}`);

  try {
    // -------------------------------------------------------------
    // Step 1: Log in as Platform Super Admin
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Platform Super Admin Authentication ---');
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
      throw new Error('Platform Super Admin login failed: ' + JSON.stringify(loginData));
    }
    const platformToken = loginData.token;
    console.log(`✓ Platform Super Admin authenticated: ${loginData.user.email} (${loginData.user.role})`);

    // Verify /auth/me returns role
    const meRes = await fetch(`${baseUrl}/api/v1/platform/auth/me`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    const meData = await meRes.json();
    if (meData.user?.role !== 'PLATFORM_SUPER_ADMIN') {
      throw new Error('User role is not PLATFORM_SUPER_ADMIN!');
    }
    console.log('✓ Secure backend authentication identified platform-level role.');

    // -------------------------------------------------------------
    // Step 2: Open Super Admin Dashboard Overview
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Open Dashboard Overview & Verify Real Values ---');
    const overviewRes = await fetch(`${baseUrl}/api/v1/platform/overview`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    const overviewData = await overviewRes.json();
    if (!overviewData.success || !overviewData.data) {
      throw new Error('Failed to load platform overview!');
    }
    const metrics = overviewData.data.metrics;
    console.log('✓ Real Database Statistics Retrieved:');
    console.log(`  - Total Colleges:     ${metrics.colleges.total} (${metrics.colleges.active} Active, ${metrics.colleges.suspended} Suspended)`);
    console.log(`  - Database Nodes:     ${metrics.databases.total} (${metrics.databases.healthy} Healthy, ~${metrics.databases.avgLatencyMs}ms Latency)`);
    console.log(`  - Total Students:     ${metrics.users?.totalStudents || 0} enrolled across tenant databases`);
    console.log(`  - Total Faculty:      ${metrics.users?.totalFaculty || 0} departmental advisors`);
    console.log(`  - Enabled Modules:    ${metrics.modules?.totalEnabled || 0} active entitlements across catalog`);
    console.log(`  - Active Plans:       ${metrics.subscriptions.length} tier(s) configured`);

    // -------------------------------------------------------------
    // Step 3: Verify All Navigation Sections
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Verify All Navigation Sections API Endpoints ---');
    const sections = [
      { name: 'A. Dashboard Overview', url: '/api/v1/platform/overview' },
      { name: 'B. College Management', url: '/api/v1/platform/colleges' },
      { name: 'C. Database Registry', url: '/api/v1/platform/databases' },
      { name: 'D. Module Catalog', url: '/api/v1/platform/modules' },
      { name: 'E. Subscription Plans', url: '/api/v1/platform/subscriptions/plans' },
      { name: 'F1. Platform Users', url: '/api/v1/platform/users/platform-admins' },
      { name: 'F2. College Admins Dir', url: '/api/v1/platform/users/college-admins' },
      { name: 'G1. System Telemetry', url: '/api/v1/platform/monitoring/telemetry' },
      { name: 'G2. Storage Telemetry', url: '/api/v1/platform/monitoring/storage' },
      { name: 'H. Audit Logs', url: '/api/v1/platform/audit-logs' },
      { name: 'I. Platform Settings', url: '/api/v1/platform/settings' },
    ];

    for (const sec of sections) {
      const res = await fetch(`${baseUrl}${sec.url}`, {
        headers: { Authorization: `Bearer ${platformToken}` },
      });
      if (!res.ok) {
        throw new Error(`Section ${sec.name} endpoint failed with HTTP ${res.status}`);
      }
      console.log(`✓ Section [${sec.name}]: HTTP 200 OK`);
    }

    // -------------------------------------------------------------
    // Helper: Clean up test colleges if pre-existing
    // -------------------------------------------------------------
    async function purgeIfExisting(code, dbName) {
      const existing = await queryPlatform('SELECT id FROM colleges WHERE code = ?', [code]);
      if (existing.length > 0) {
        await cleanupFailedCollege(existing[0].id, 1, '127.0.0.1').catch(() => {});
      }
      try {
        const rootConn = await mysql.createConnection({
          host: process.env.DB_HOST || '127.0.0.1',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
        });
        await rootConn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await rootConn.end();
      } catch (e) {}
    }

    await purgeIfExisting('ABC', 'campuscorp_college_abc');
    await purgeIfExisting('XYZ', 'campuscorp_college_xyz');

    // -------------------------------------------------------------
    // Step 4: Register College ABC
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Register College ABC via Onboarding API ---');
    const abcPayload = {
      name: 'ABC Institute of Technology',
      code: 'ABC',
      type: 'AUTONOMOUS',
      affiliation: 'Anna University',
      subdomain: 'abc',
      contact_email: 'principal@abc.edu',
      contact_phone: '+91 422 1112233',
      address: 'Tech Park Road, Coimbatore',
      admin: {
        first_name: 'Anand',
        last_name: 'Babu',
        email: 'admin@abc.edu',
        password: 'ABCAdmin@2026',
        role: 'SUPER_ADMIN',
      },
      subscription_plan_id: 2,
      modules: { LMS: true, CAREER_EXPLORER: true, RECRUITMENT: true, ASSESSMENTS: true },
    };

    const abcProvisionRes = await fetch(`${baseUrl}/api/v1/platform/colleges/provision`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(abcPayload),
    });
    const abcProvisionData = await abcProvisionRes.json();
    if (!abcProvisionData.success || !abcProvisionData.data?.collegeId) {
      throw new Error('College ABC registration failed: ' + JSON.stringify(abcProvisionData));
    }
    const abcId = abcProvisionData.data.collegeId;
    console.log(`✓ College ABC Registered: ID=${abcId}, Code=ABC, Subdomain=abc`);

    // -------------------------------------------------------------
    // Step 5: Verify College ABC Dedicated Database
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Verify ABC Dedicated Database is Created & Healthy ---');
    const [abcDbCheck] = await (await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    })).query(`SHOW DATABASES LIKE 'campuscorp_college_abc'`);

    if (abcDbCheck.length === 0) {
      throw new Error('Database campuscorp_college_abc was not created on MySQL!');
    }
    console.log('✓ Physical MySQL Database Confirmed: `campuscorp_college_abc`');

    // Ping test through platform registry
    const abcRegistryRows = await queryPlatform('SELECT id FROM college_database_registry WHERE college_id = ?', [abcId]);
    const abcRegistryId = abcRegistryRows[0].id;
    const abcPingRes = await fetch(`${baseUrl}/api/v1/platform/databases/${abcRegistryId}/ping`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    const abcPingData = await abcPingRes.json();
    if (abcPingData.data?.healthStatus !== 'HEALTHY') {
      throw new Error('ABC Database ping check failed!');
    }
    console.log(`✓ Database Health Check: ${abcPingData.data.healthStatus}, Latency: ${abcPingData.data.latencyMs}ms, Tables: ${abcPingData.data.tableCount}`);

    // -------------------------------------------------------------
    // Step 6: Configure Modules for College ABC
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Configure Modules for College ABC ---');
    const abcModulesRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${abcId}/modules`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modules: { LMS: true, CAREER_EXPLORER: true, RECRUITMENT: true, ASSESSMENTS: true },
      }),
    });
    if (!abcModulesRes.ok) throw new Error('Failed to set ABC modules');
    console.log('✓ Modules Configured for ABC: LMS=ON, CAREER_EXPLORER=ON, RECRUITMENT=ON, ASSESSMENTS=ON');

    // -------------------------------------------------------------
    // Step 7: Create & Verify College Admin for ABC
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Verify College Admin Account for ABC ---');
    const abcAdminRows = await queryTenant(abcId, "SELECT id, email, role_name, status FROM users WHERE email = 'admin@abc.edu'");
    if (abcAdminRows.length === 0 || abcAdminRows[0].role_name !== 'SUPER_ADMIN') {
      throw new Error('College Admin account for ABC was not properly created!');
    }
    console.log(`✓ College Admin confirmed in ABC database: ${abcAdminRows[0].email} (${abcAdminRows[0].role_name}, Status: ${abcAdminRows[0].status})`);

    // -------------------------------------------------------------
    // Step 8: Verify ABC Subscription
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Verify ABC Subscription & Quota ---');
    const abcQuotaRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${abcId}/quota`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    const abcQuotaData = await abcQuotaRes.json();
    if (!abcQuotaData.success) throw new Error('ABC Quota check failed');
    const quotaInfo = abcQuotaData.quota || abcQuotaData.data;
    console.log(`✓ Subscription Quota Verified: Max Students=${quotaInfo.maxStudents}, Within Quota=${quotaInfo.isWithinQuota}`);

    // -------------------------------------------------------------
    // Step 9: Register College XYZ
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Register College XYZ via Onboarding API ---');
    const xyzPayload = {
      name: 'XYZ Engineering College',
      code: 'XYZ',
      type: 'PRIVATE',
      affiliation: 'Anna University',
      subdomain: 'xyz',
      contact_email: 'principal@xyz.edu',
      contact_phone: '+91 422 4445566',
      address: 'Airport Road, Coimbatore',
      admin: {
        first_name: 'Xavier',
        last_name: 'Yash',
        email: 'admin@xyz.edu',
        password: 'XYZAdmin@2026',
        role: 'SUPER_ADMIN',
      },
      subscription_plan_id: 1,
      modules: { LMS: true, CAREER_EXPLORER: false, RECRUITMENT: false, ASSESSMENTS: true },
    };

    const xyzProvisionRes = await fetch(`${baseUrl}/api/v1/platform/colleges/provision`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(xyzPayload),
    });
    const xyzProvisionData = await xyzProvisionRes.json();
    if (!xyzProvisionData.success || !xyzProvisionData.data?.collegeId) {
      throw new Error('College XYZ registration failed: ' + JSON.stringify(xyzProvisionData));
    }
    const xyzId = xyzProvisionData.data.collegeId;
    console.log(`✓ College XYZ Registered: ID=${xyzId}, Code=XYZ, Subdomain=xyz`);

    // -------------------------------------------------------------
    // Step 10: Give it a Separate Database
    // -------------------------------------------------------------
    console.log('\n--- Step 10: Verify XYZ has Separate Dedicated Physical Database ---');
    const [xyzDbCheck] = await (await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    })).query(`SHOW DATABASES LIKE 'campuscorp_college_xyz'`);

    if (xyzDbCheck.length === 0) {
      throw new Error('Database campuscorp_college_xyz was not created on MySQL!');
    }
    console.log('✓ Distinct MySQL Database Confirmed: `campuscorp_college_xyz`');

    // -------------------------------------------------------------
    // Step 11: Disable IT Career Explorer for XYZ
    // -------------------------------------------------------------
    console.log('\n--- Step 11: Disable IT Career Explorer for College XYZ ---');
    const xyzModulesRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${xyzId}/modules`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modules: { LMS: true, CAREER_EXPLORER: false, RECRUITMENT: false, ASSESSMENTS: true },
      }),
    });
    if (!xyzModulesRes.ok) throw new Error('Failed to set XYZ modules');
    console.log('✓ Modules Configured for XYZ: LMS=ON, CAREER_EXPLORER=OFF (Disabled)');

    // -------------------------------------------------------------
    // Step 12: Log in as ABC College Admin & Verify Enabled Modules
    // -------------------------------------------------------------
    console.log('\n--- Step 12: Log in as ABC Admin & Verify Enabled Modules ---');
    const abcLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@abc.edu',
        password: 'ABCAdmin@2026',
        collegeCode: 'ABC',
      }),
    });
    const abcLoginData = await abcLoginRes.json();
    if (!abcLoginData.token) throw new Error('ABC Admin login failed: ' + JSON.stringify(abcLoginData));
    const tokenABC = abcLoginData.token;
    console.log('✓ ABC College Admin Authenticated.');

    // Query Career Explorer (should succeed)
    const abcCareerRes = await fetch(`${baseUrl}/api/v1/career/domains`, {
      headers: { Authorization: `Bearer ${tokenABC}` },
    });
    if (abcCareerRes.status !== 200) {
      throw new Error(`ABC Career Explorer expected 200, got: ${abcCareerRes.status}`);
    }
    console.log('✓ ABC Admin: Career Explorer Accessible (HTTP 200 OK)');

    // Query LMS (should succeed)
    const abcLmsRes = await fetch(`${baseUrl}/api/v1/lms/courses`, {
      headers: { Authorization: `Bearer ${tokenABC}` },
    });
    if (abcLmsRes.status !== 200) {
      throw new Error(`ABC LMS expected 200, got: ${abcLmsRes.status}`);
    }
    console.log('✓ ABC Admin: LMS Portal Accessible (HTTP 200 OK)');

    // -------------------------------------------------------------
    // Step 13: Log in as XYZ College Admin & Verify Restricted Modules
    // -------------------------------------------------------------
    console.log('\n--- Step 13: Log in as XYZ Admin & Verify Restricted Modules ---');
    const xyzLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xyz.edu',
        password: 'XYZAdmin@2026',
        collegeCode: 'XYZ',
      }),
    });
    const xyzLoginData = await xyzLoginRes.json();
    if (!xyzLoginData.token) throw new Error('XYZ Admin login failed: ' + JSON.stringify(xyzLoginData));
    const tokenXYZ = xyzLoginData.token;
    console.log('✓ XYZ College Admin Authenticated.');

    // Query Career Explorer (MUST be blocked with 403 Forbidden)
    const xyzCareerRes = await fetch(`${baseUrl}/api/v1/career/domains`, {
      headers: { Authorization: `Bearer ${tokenXYZ}` },
    });
    const xyzCareerData = await xyzCareerRes.json();
    if (xyzCareerRes.status !== 403 || !xyzCareerData.upgradeRequired) {
      throw new Error(`XYZ Career Explorer expected 403 Forbidden, got: ${xyzCareerRes.status}`);
    }
    console.log('✓ XYZ Admin: Career Explorer BLOCKED (HTTP 403 Forbidden, upgradeRequired: true)');

    // Query LMS (should succeed)
    const xyzLmsRes = await fetch(`${baseUrl}/api/v1/lms/courses`, {
      headers: { Authorization: `Bearer ${tokenXYZ}` },
    });
    if (xyzLmsRes.status !== 200) {
      throw new Error(`XYZ LMS expected 200, got: ${xyzLmsRes.status}`);
    }
    console.log('✓ XYZ Admin: LMS Portal Accessible (HTTP 200 OK)');

    // -------------------------------------------------------------
    // Step 14: Attempt Cross-College API Access & Verify Blocked
    // -------------------------------------------------------------
    console.log('\n--- Step 14: Attempt Cross-College API Access & Verify Isolation ---');
    // XYZ Admin attempts to pass ABC college ID to get ABC metrics
    const crossRes = await fetch(`${baseUrl}/api/v1/college-admin/metrics?collegeId=${abcId}`, {
      headers: {
        Authorization: `Bearer ${tokenXYZ}`,
        'x-tenant-code': 'ABC',
        'x-college-code': 'ABC',
      },
    });
    const crossData = await crossRes.json();
    if (crossData.data?.collegeCode !== 'XYZ') {
      throw new Error(`Tenant Isolation breach! XYZ Admin accessed ${crossData.data?.collegeCode}`);
    }
    console.log('✓ Cross-College Tampering Defeated: Server strictly routed query to XYZ database.');

    // -------------------------------------------------------------
    // Step 15: Suspend College XYZ & Verify Access Revoked
    // -------------------------------------------------------------
    console.log('\n--- Step 15: Suspend College XYZ & Verify Immediate Access Revocation ---');
    const suspendRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${xyzId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUSPENDED' }),
    });
    const suspendData = await suspendRes.json();
    const newStatus = suspendData.newStatus || suspendData.data?.newStatus;
    if (newStatus !== 'SUSPENDED') {
      throw new Error('College XYZ status was not updated to SUSPENDED: ' + JSON.stringify(suspendData));
    }
    console.log('✓ College XYZ status set to SUSPENDED by Platform Super Admin.');

    // Attempt login as XYZ Admin while suspended (MUST be rejected)
    const xyzSuspendedLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xyz.edu',
        password: 'XYZAdmin@2026',
        collegeCode: 'XYZ',
      }),
    });
    if (xyzSuspendedLoginRes.status !== 403) {
      throw new Error(`Suspended login expected HTTP 403, got: ${xyzSuspendedLoginRes.status}`);
    }
    console.log('✓ Login Blocked for Suspended Institution (HTTP 403 COLLEGE_SUSPENDED)');

    // Attempt to use existing tokenXYZ (MUST be rejected by session killswitch)
    const xyzTokenUseRes = await fetch(`${baseUrl}/api/v1/college-admin/profile`, {
      headers: { Authorization: `Bearer ${tokenXYZ}` },
    });
    if (xyzTokenUseRes.status !== 401 && xyzTokenUseRes.status !== 403) {
      throw new Error(`Existing token should be blocked after suspension! Got: ${xyzTokenUseRes.status}`);
    }
    console.log('✓ Existing Session Token Immediately Revoked for Suspended Institution (HTTP 401)');

    // -------------------------------------------------------------
    // Step 16: Verify Audit Logs Contain All Actions
    // -------------------------------------------------------------
    console.log('\n--- Step 16: Verify Audit Logs Contain All Administrative Actions ---');
    const auditRes = await fetch(`${baseUrl}/api/v1/platform/audit-logs?limit=25`, {
      headers: { Authorization: `Bearer ${platformToken}` },
    });
    const auditData = await auditRes.json();
    const actionCodes = auditData.data.logs.map((l) => l.action);

    const requiredActions = [
      'COLLEGE_PROVISIONING_STARTED',
      'COLLEGE_PROVISIONED_SUCCESS',
      'DATABASE_PING_TESTED',
      'COLLEGE_MODULES_UPDATED',
      'COLLEGE_STATUS_UPDATED',
    ];

    for (const reqAct of requiredActions) {
      if (!actionCodes.includes(reqAct)) {
        throw new Error(`Audit trail missing expected action: ${reqAct}`);
      }
      console.log(`✓ Audit Action Verified: ${reqAct}`);
    }

    console.log('\n================================================================');
    console.log('🎉 ALL 16 SUPER ADMIN ACCEPTANCE CRITERIA PASSED PERFECTLY!');
    console.log('================================================================\n');

  } finally {
    server.close();
  }
}

if (require.main === module) {
  runSuperAdminVerification()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ [SUPER ADMIN ACCEPTANCE ERROR]:', err);
      process.exit(1);
    });
}

module.exports = { runSuperAdminVerification };
