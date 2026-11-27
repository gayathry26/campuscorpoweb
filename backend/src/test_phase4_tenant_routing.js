const http = require('http');
const jwt = require('jsonwebtoken');
const { app } = require('./server');
const { checkPlatformHealth } = require('./config/platformDb');
const { resolveTenantMetadata, getTenantPool, queryTenant, checkTenantHealth } = require('./config/tenantConnectionManager');
const { isModuleEnabledForCollege } = require('./middleware/moduleEntitlementGuard');
const { JWT_SECRET } = require('./middleware/auth');

async function runPhase4Tests() {
  console.log('================================================================');
  console.log('🧪 [PHASE 4 TEST] Dynamic Tenant Database Connection Manager & Routing Suite');
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
    // =================================================================
    // TEST 1: DYNAMIC TENANT CONNECTION POOL MANAGER
    // =================================================================
    console.log('\n--- Test 1: Tenant Resolution & Connection Pool Management ---');

    // 1a. Resolve Flagship Tenant
    const flagshipMeta = await resolveTenantMetadata('CAMPUS_MAIN');
    console.log(`✓ Flagship resolved: Code=${flagshipMeta.code}, DB=${flagshipMeta.database_name}`);
    if (flagshipMeta.code !== 'CAMPUS_MAIN') {
      throw new Error("Expected flagship code 'CAMPUS_MAIN'");
    }

    // 1b. Resolve KCT Tenant by Code
    const kctMeta = await resolveTenantMetadata('KCT');
    console.log(`✓ KCT resolved by code: Name=${kctMeta.name}, DB=${kctMeta.database_name}`);
    if (kctMeta.database_name !== 'campuscorp_college_kct') {
      throw new Error(`Expected KCT database 'campuscorp_college_kct' but got '${kctMeta.database_name}'`);
    }

    // 1c. Resolve KCT Tenant by Subdomain
    const kctBySubdomain = await resolveTenantMetadata('kct');
    console.log(`✓ KCT resolved by subdomain: Name=${kctBySubdomain.name}, Code=${kctBySubdomain.code}`);
    if (kctBySubdomain.id !== kctMeta.id) {
      throw new Error('Subdomain resolution ID mismatch!');
    }

    // 1d. Initialize Dynamic Pool & Check Real-time Health
    const kctHealth = await checkTenantHealth('KCT');
    console.log(`✓ KCT Tenant DB Health: Healthy=${kctHealth.healthy}, DB=${kctHealth.database}, Latency=${kctHealth.latencyMs}ms`);
    if (!kctHealth.healthy) {
      throw new Error('KCT tenant database health check failed!');
    }

    // =================================================================
    // TEST 2: TENANT-AWARE LOGIN & CROSS-TENANT ISOLATION
    // =================================================================
    console.log('\n--- Test 2: Tenant-Aware Login & Database Isolation ---');

    // 2a. Login as KCT College Super Admin (Database: campuscorp_college_kct)
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
    console.log(`✓ KCT Admin Login HTTP ${kctLoginRes.status}:`, kctLoginData.message);
    if (kctLoginRes.status !== 200 || !kctLoginData.token) {
      throw new Error('KCT login failed: ' + JSON.stringify(kctLoginData));
    }

    const kctToken = kctLoginData.token;
    const kctDecoded = jwt.verify(kctToken, JWT_SECRET);
    console.log(`✓ KCT Token Claims: CollegeID=${kctDecoded.collegeId}, Code=${kctDecoded.collegeCode}, DB=${kctDecoded.dbName}, Role=${kctDecoded.roleName}`);
    if (kctDecoded.collegeCode !== 'KCT' || kctDecoded.dbName !== 'campuscorp_college_kct') {
      throw new Error('Token does not contain expected KCT tenant claims!');
    }

    // 2b. Call /auth/me with KCT Token -> should resolve Karthik Rajan from campuscorp_college_kct
    const kctMeRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    const kctMeData = await kctMeRes.json();
    console.log(`✓ /auth/me for KCT: User=${kctMeData.user.firstName} ${kctMeData.user.lastName}, Email=${kctMeData.user.email}`);
    if (kctMeData.user.email !== 'admin@kct.ac.in') {
      throw new Error('User email mismatch on /auth/me');
    }

    // 2c. Call /college-admin/profile with KCT Token
    const kctProfileRes = await fetch(`${baseUrl}/api/v1/college-admin/profile`, {
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    const kctProfileData = await kctProfileRes.json();
    console.log(`✓ /college-admin/profile: College=${kctProfileData.college.name}, DB=${kctProfileData.college.databaseName}, Type=${kctProfileData.college.type}`);

    // 2d. Call /college-admin/metrics with KCT Token -> verifies isolated metrics
    const kctMetricsRes = await fetch(`${baseUrl}/api/v1/college-admin/metrics`, {
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    const kctMetricsData = await kctMetricsRes.json();
    console.log(`✓ /college-admin/metrics: Departments=${kctMetricsData.data.metrics.departmentsCount}, TotalUsers=${kctMetricsData.data.metrics.totalUsers}`);
    if (kctMetricsData.data.metrics.departmentsCount !== 6) {
      throw new Error('Expected 6 seeded departments in KCT database!');
    }

    // =================================================================
    // TEST 3: SUBDOMAIN & HEADER ROUTING
    // =================================================================
    console.log('\n--- Test 3: Header Routing & Tenant Context Extraction ---');

    // Make an API call passing X-Tenant-Code: KCT
    const headerTestRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Code': 'KCT',
      },
      body: JSON.stringify({
        email: 'admin@kct.ac.in',
        password: 'CollegeAdmin@2026',
      }),
    });
    const headerTestData = await headerTestRes.json();
    console.log(`✓ Login with X-Tenant-Code Header: HTTP ${headerTestRes.status}:`, headerTestData.message);
    if (headerTestData.college?.code !== 'KCT') {
      throw new Error('Header routing did not resolve KCT!');
    }

    // =================================================================
    // TEST 4: MODULE ENTITLEMENT ENFORCEMENT
    // =================================================================
    console.log('\n--- Test 4: Module Entitlement Guard ---');
    const isLmsEnabled = await isModuleEnabledForCollege(kctMeta.id, 'LMS');
    console.log(`✓ KCT LMS Entitlement: ${isLmsEnabled ? 'Enabled' : 'Disabled'}`);
    if (!isLmsEnabled) {
      throw new Error('LMS module expected to be enabled for KCT!');
    }

    const isCareerEnabled = await isModuleEnabledForCollege(kctMeta.id, 'CAREER_EXPLORER');
    console.log(`✓ KCT Career Explorer Entitlement: ${isCareerEnabled ? 'Enabled' : 'Disabled'}`);
    if (!isCareerEnabled) {
      throw new Error('Career Explorer module expected to be enabled for KCT!');
    }

    console.log('\n================================================================');
    console.log('🎉 [PHASE 4 COMPLETE] Dynamic Tenant Connection Manager & Routing Suite Passed!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runPhase4Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [PHASE 4 SUITE FAILED]:', err);
    process.exit(1);
  });

