/**
 * CampusCorp Multi-Tenant SaaS Platform - Master Regression Test Suite
 * Executes all Phase 2 through Phase 5 test suites sequentially and validates end-to-end integrity.
 */

const { spawn } = require('child_process');
const path = require('path');

const suites = [
  { name: 'Phase 2: Platform Super Admin APIs & Registry', file: 'test_e2e_platform.js' },
  { name: 'Phase 3: Automated Database Provisioning & Rollback', file: 'test_phase3_provisioning.js' },
  { name: 'Phase 4: Dynamic Tenant Routing & Pool Management', file: 'test_phase4_tenant_routing.js' },
  { name: 'Phase 5: College Administration & Cross-Tenant Isolation', file: 'test_phase5_cross_tenant_security.js' },
  { name: 'Phase 6: Multi-Tenant Auth, RBAC & Revocation', file: 'test_phase6_auth_rbac_revocation.js' },
  { name: 'Phase 7: Subscriptions, Monitoring & Audit Logs', file: 'test_phase7_subscriptions_monitoring_audit.js' },
  { name: 'Phase 8: End-to-End, Security & Concurrency Validation', file: 'test_phase8_e2e_security_validation.js' }
];

console.log('================================================================');
console.log('🚀 [CAMPUSCORP SaaS] Running Master Multi-Tenant Regression Suite');
console.log('================================================================\n');

let passedCount = 0;
let failedCount = 0;
const startTime = Date.now();

async function runAll() {
  for (const suite of suites) {
    console.log(`▶ Running Suite: ${suite.name} (${suite.file})...`);
    const suiteStart = Date.now();

    const code = await new Promise((resolve) => {
      const child = spawn(process.execPath, [path.join(__dirname, suite.file)], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' }
      });

      child.on('close', (exitCode) => {
        resolve(exitCode);
      });
    });

    const duration = ((Date.now() - suiteStart) / 1000).toFixed(2);
    if (code === 0) {
      console.log(`\n✅ [PASSED] ${suite.name} in ${duration}s\n`);
      passedCount++;
    } else {
      console.error(`\n❌ [FAILED] ${suite.name} with exit code ${code} in ${duration}s\n`);
      failedCount++;
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('================================================================');
  console.log('📊 MASTER REGRESSION SUITE RESULTS:');
  console.log(`   Total Suites: ${suites.length}`);
  console.log(`   Passed:       ${passedCount}`);
  console.log(`   Failed:       ${failedCount}`);
  console.log(`   Duration:     ${totalDuration}s`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL MULTI-TENANT SAAS REGRESSION SUITES PASSED PERFECTLY!\n');
    process.exit(0);
  }
}

runAll().catch(err => {
  console.error('Fatal suite runner error:', err);
  process.exit(1);
});
