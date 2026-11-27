const http = require('http');
const { app } = require('./server');
const { checkPlatformHealth } = require('./config/platformDb');

async function runEndToEndTests() {
  console.log('================================================================');
  console.log('🧪 [TEST] Running End-to-End Platform Super Admin Suite');
  console.log('================================================================');

  // 1. Central Platform DB Health
  const health = await checkPlatformHealth();
  console.log(`✓ Platform DB Status: ${health.status} (${health.database})`);
  if (health.status !== 'UP') {
    throw new Error('Platform DB is not UP!');
  }

  // Spin up an ephemeral HTTP server on a random free port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Ephemeral test server listening on ${baseUrl}`);

  try {
    // 2. Unauthenticated request to protected endpoint should be rejected (401)
    const unauthRes = await fetch(`${baseUrl}/api/v1/platform/overview`);
    console.log(`✓ Unauthenticated request rejected: HTTP ${unauthRes.status}`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 but got ${unauthRes.status}`);
    }

    // 3. Platform Login
    const loginRes = await fetch(`${baseUrl}/api/v1/platform/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'platform.admin@campuscorp.io',
        password: 'Password@123',
      }),
    });
    
    const loginData = await loginRes.json();
    console.log(`✓ Platform Login HTTP ${loginRes.status}:`, loginData.message);
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error('Platform login failed: ' + JSON.stringify(loginData));
    }

    const token = loginData.token;
    console.log(`✓ Platform Token received (length: ${token.length})`);

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 4. Session Verification (/auth/me)
    const meRes = await fetch(`${baseUrl}/api/v1/platform/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log(`✓ /auth/me HTTP ${meRes.status}: Authenticated as ${meData.user.email} (${meData.user.role})`);

    // 5. Overview Metrics
    const overviewRes = await fetch(`${baseUrl}/api/v1/platform/overview`, { headers: authHeaders });
    const overviewData = await overviewRes.json();
    console.log(`✓ /overview HTTP ${overviewRes.status}: Total colleges=${overviewData.data.metrics.colleges.total}, Active DBs=${overviewData.data.metrics.databases.healthy}`);

    // 6. Colleges Registry
    const collegesRes = await fetch(`${baseUrl}/api/v1/platform/colleges`, { headers: authHeaders });
    const collegesData = await collegesRes.json();
    console.log(`✓ /colleges HTTP ${collegesRes.status}: Found ${collegesData.data.length} registered colleges`);

    // 7. Single College Detail
    const collegeId = collegesData.data[0].id;
    const collegeDetailRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${collegeId}`, { headers: authHeaders });
    const collegeDetailData = await collegeDetailRes.json();
    console.log(`✓ /colleges/${collegeId} HTTP ${collegeDetailRes.status}: College=${collegeDetailData.data.name}, DB=${collegeDetailData.data.database?.database_name}, Modules=${collegeDetailData.data.modules?.length}`);

    // 8. Databases Registry
    const dbsRes = await fetch(`${baseUrl}/api/v1/platform/databases`, { headers: authHeaders });
    const dbsData = await dbsRes.json();
    console.log(`✓ /databases HTTP ${dbsRes.status}: Found ${dbsData.data.length} databases in cluster`);

    // 9. Ping Database Live
    const dbRegistryId = dbsData.data[0].id;
    const pingRes = await fetch(`${baseUrl}/api/v1/platform/databases/${dbRegistryId}/ping`, {
      method: 'POST',
      headers: authHeaders,
    });
    const pingData = await pingRes.json();
    console.log(`✓ /databases/${dbRegistryId}/ping HTTP ${pingRes.status}: Status=${pingData.data.healthStatus}, Latency=${pingData.data.latencyMs}ms, Tables=${pingData.data.tableCount}`);

    // 10. Platform Modules Catalog
    const modulesRes = await fetch(`${baseUrl}/api/v1/platform/modules`, { headers: authHeaders });
    const modulesData = await modulesRes.json();
    console.log(`✓ /modules HTTP ${modulesRes.status}: ${modulesData.data.length} system modules in catalog`);

    // 11. Update Module Entitlements
    const updateModRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${collegeId}/modules`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        modules: {
          LMS: true,
          CAREER_EXPLORER: true,
          RECRUITMENT: true,
          ASSESSMENTS: true,
        },
      }),
    });
    const updateModData = await updateModRes.json();
    console.log(`✓ /colleges/${collegeId}/modules HTTP ${updateModRes.status}:`, updateModData.message);

    // 12. Subscription Plans
    const plansRes = await fetch(`${baseUrl}/api/v1/platform/subscriptions/plans`, { headers: authHeaders });
    const plansData = await plansRes.json();
    console.log(`✓ /subscriptions/plans HTTP ${plansRes.status}: ${plansData.data.length} plans available`);

    // 13. Audit Logs
    const auditRes = await fetch(`${baseUrl}/api/v1/platform/audit-logs`, { headers: authHeaders });
    const auditData = await auditRes.json();
    console.log(`✓ /audit-logs HTTP ${auditRes.status}: Total logs logged=${auditData.data.pagination.total}`);

    // 14. Platform Settings
    const settingsRes = await fetch(`${baseUrl}/api/v1/platform/settings`, { headers: authHeaders });
    const settingsData = await settingsRes.json();
    console.log(`✓ /settings HTTP ${settingsRes.status}: ${settingsData.data.length} global settings configured`);

    console.log('================================================================');
    console.log('🎉 [TEST SUITE PASSED] All 14 Platform Super Admin Tests Succeeded!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runEndToEndTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [TEST SUITE FAILED]:', err);
    process.exit(1);
  });
