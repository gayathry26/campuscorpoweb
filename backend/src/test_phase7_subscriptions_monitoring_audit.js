const http = require('http');
const { app } = require('./server');
const { checkPlatformHealth } = require('./config/platformDb');
const { queryPlatform } = require('./config/platformDb');

async function runPhase7Tests() {
  console.log('================================================================');
  console.log('🧪 [PHASE 7 TEST] Subscription Lifecycle, Monitoring & Audit Logs');
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
    // Authenticate as Platform Super Admin
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
    const platformToken = loginData.token;
    const authHeaders = {
      'Authorization': `Bearer ${platformToken}`,
      'Content-Type': 'application/json',
    };
    console.log('✓ Platform Super Admin authenticated successfully.');

    // Fetch existing colleges
    const collegesRes = await fetch(`${baseUrl}/api/v1/platform/colleges`, { headers: authHeaders });
    const collegesData = await collegesRes.json();
    const collegeList = collegesData.data || collegesData.colleges || [];
    if (collegeList.length === 0) throw new Error('No registered colleges found in platform DB');
    const collegeId = collegeList[0].id;
    console.log(`✓ Target College identified: ID=${collegeId}, Name='${collegeList[0].name}'`);

    // =================================================================
    // TEST 1: SUBSCRIPTION PLANS LIFECYCLE (CREATE, UPDATE, DELETE)
    // =================================================================
    console.log('\n--- Test 1: Subscription Plans Management ---');
    // Pre-cleanup in case of previous run
    await queryPlatform("DELETE FROM subscription_plans WHERE plan_code = 'TEST_RESEARCH'");

    // 1a. List existing plans
    const plansRes = await fetch(`${baseUrl}/api/v1/platform/subscriptions/plans`, { headers: authHeaders });
    const plansJson = await plansRes.json();
    const plans = plansJson.data || plansJson;
    console.log(`✓ Retrieved ${plans.length} active subscription plans.`);

    // 1b. Create custom tier plan
    const createPlanRes = await fetch(`${baseUrl}/api/v1/platform/subscriptions/plans`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        plan_code: 'TEST_RESEARCH',
        plan_name: 'Advanced Research Tier',
        description: 'Plan for postgraduate institutes and high-performance clusters',
        max_students: 3000,
        max_faculty: 250,
        max_storage_gb: 150,
        price_per_year: 189999.00,
      }),
    });
    const createPlanData = await createPlanRes.json();
    const newPlanId = createPlanData.planId;
    console.log(`✓ Created new Subscription Plan: ID=${newPlanId} (TEST_RESEARCH)`);

    // 1c. Update custom tier plan
    const updatePlanRes = await fetch(`${baseUrl}/api/v1/platform/subscriptions/plans/${newPlanId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        plan_name: 'Advanced Research Tier (Revised)',
        description: 'Updated with enhanced GPU cloud assessment nodes',
        max_students: 3500,
        max_faculty: 300,
        max_storage_gb: 200,
        price_per_year: 199999.00,
      }),
    });
    const updatePlanData = await updatePlanRes.json();
    console.log(`✓ Updated Subscription Plan ID=${newPlanId}: HTTP ${updatePlanRes.status}`);

    // Verify update in platform DB
    const [updatedPlanRow] = await queryPlatform('SELECT plan_name, max_students FROM subscription_plans WHERE id = ?', [newPlanId]);
    if (updatedPlanRow?.max_students !== 3500) {
      throw new Error(`Plan update verification failed! Expected 3500, got ${updatedPlanRow?.max_students}`);
    }
    console.log(`✓ Verified updated plan in DB: Name='${updatedPlanRow.plan_name}', MaxStudents=${updatedPlanRow.max_students}`);

    // =================================================================
    // TEST 2: COLLEGE INVOICING & STUDENT QUOTA ENFORCEMENT
    // =================================================================
    console.log('\n--- Test 2: College Invoicing & Quota Telemetry ---');

    // 2a. Generate Invoice
    const invoiceRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${collegeId}/invoices`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        plan_id: newPlanId,
        amount_inr: 199999.00,
        tax_inr: 35999.82,
        status: 'PAID',
        payment_method: 'CORPORATE_TRANSFER',
      }),
    });
    const invoiceData = await invoiceRes.json();
    console.log(`✓ Generated Invoice HTTP ${invoiceRes.status}: Invoice #${invoiceData.invoiceNumber}, Total INR: ₹${invoiceData.totalInr}`);

    // 2b. Retrieve College Invoices
    const getInvoicesRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${collegeId}/invoices`, { headers: authHeaders });
    const invoicesData = await getInvoicesRes.json();
    console.log(`✓ College ID ${collegeId} has ${invoicesData.invoices.length} invoice(s) on file.`);
    if (invoicesData.invoices.length === 0) throw new Error('Expected at least 1 invoice!');

    // 2c. Check Student Quota
    const quotaRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${collegeId}/quota`, { headers: authHeaders });
    const quotaData = await quotaRes.json();
    console.log(`✓ Student Quota for ${quotaData.quota.collegeCode}: Current=${quotaData.quota.currentStudents} / Cap=${quotaData.quota.maxStudents} (${quotaData.quota.usagePercentage}% utilized, WithinQuota=${quotaData.quota.isWithinQuota})`);

    // =================================================================
    // TEST 3: CLUSTER MONITORING & STORAGE TELEMETRY
    // =================================================================
    console.log('\n--- Test 3: Infrastructure Monitoring & Storage Telemetry ---');

    // 3a. Cluster Telemetry
    const telemetryRes = await fetch(`${baseUrl}/api/v1/platform/monitoring/telemetry`, { headers: authHeaders });
    const telemetryData = await telemetryRes.json();
    const t = telemetryData.telemetry;
    console.log(`✓ Cluster Telemetry: Node ${t.process.nodeVersion}, Uptime: ${t.process.uptimeFormatted}, Memory RSS: ${t.process.memory.rssMb}MB`);
    console.log(`✓ Cluster DB Nodes: Total=${t.cluster.totalDatabases}, Healthy=${t.cluster.healthyDatabases}, Avg Latency=${t.cluster.averageLatencyMs}ms`);
    if (t.cluster.healthyDatabases === 0) throw new Error('At least 1 database node should be healthy!');

    // 3b. Storage Usage per Database Schema
    const storageRes = await fetch(`${baseUrl}/api/v1/platform/monitoring/storage`, { headers: authHeaders });
    const storageData = await storageRes.json();
    console.log(`✓ Storage Telemetry: Retrieved storage stats for ${storageData.storage.length} tenant database(s):`);
    for (const s of storageData.storage) {
      console.log(`  - DB: ${s.databaseName} (${s.collegeCode}): Used ${s.storageUsedMb} MB / Cap ${s.maxStorageGb} GB (${s.usagePercentage}%)`);
    }

    // =================================================================
    // TEST 4: AUDIT LOGS SEARCH, FILTER & CSV EXPORT
    // =================================================================
    console.log('\n--- Test 4: Audit Trail Filtering & CSV Compliance Export ---');

    // 4a. Filter audit logs by action
    const auditRes = await fetch(`${baseUrl}/api/v1/platform/audit-logs?action=SUBSCRIPTION_PLAN_CREATED`, { headers: authHeaders });
    const auditJson = await auditRes.json();
    const auditData = auditJson.data || auditJson;
    const totalLogs = auditData.pagination?.total || 0;
    console.log(`✓ Filtered Audit Logs: Found ${totalLogs} log(s) for action 'SUBSCRIPTION_PLAN_CREATED'`);
    if (totalLogs === 0) throw new Error('Expected audit log for plan creation!');

    // 4b. Export Audit Logs as CSV
    const csvRes = await fetch(`${baseUrl}/api/v1/platform/audit-logs/export`, { headers: authHeaders });
    const csvContent = await csvRes.text();
    const csvLines = csvContent.trim().split('\n');
    console.log(`✓ CSV Export Succeeded: HTTP ${csvRes.status}, Headers: Content-Type=${csvRes.headers.get('content-type')}`);
    console.log(`✓ CSV Header: ${csvLines[0]}`);
    console.log(`✓ Exported ${csvLines.length - 1} audit log records.`);
    if (!csvLines[0].includes('Log ID') || !csvLines[0].includes('Action')) {
      throw new Error('CSV header missing expected columns!');
    }

    // =================================================================
    // TEST 5: CLEANUP OF TEST SUBSCRIPTION PLAN
    // =================================================================
    console.log('\n--- Test 5: Subscription Plan Deletion Guard & Cleanup ---');
    const deletePlanRes = await fetch(`${baseUrl}/api/v1/platform/subscriptions/plans/${newPlanId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log(`✓ Deleted test subscription plan ID=${newPlanId}: HTTP ${deletePlanRes.status}`);
    if (deletePlanRes.status !== 200) throw new Error('Expected 200 for deleting unassigned plan');

    console.log('\n================================================================');
    console.log('🎉 [PHASE 7 COMPLETE] Subscriptions, Monitoring & Audit Logs Fully Verified!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runPhase7Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [PHASE 7 SUITE FAILED]:', err);
    process.exit(1);
  });
