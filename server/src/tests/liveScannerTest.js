const assert = require('node:assert');
const { commonPool } = require('../config/db');
const { parseGithubInput, parseRepoUrl } = require('../services/githubScannerService');

const BASE = 'http://localhost:5000/api/v1';

async function runLiveSuite() {
  console.log('=== RUNNING LIVE GITHUB SCANNER E2E API VERIFICATION ===\n');

  // 1. Test URL & Profile Parsing Edge Cases
  console.log('1. Testing URL & Profile Input Parsing...');
  const p1 = parseRepoUrl('https://github.com/fastapi/fastapi?tab=readme-ov-file#installation');
  assert.strictEqual(p1.owner, 'fastapi');
  assert.strictEqual(p1.repo, 'fastapi');

  const p2 = parseRepoUrl('git@github.com:vercel/next.js.git');
  assert.strictEqual(p2.owner, 'vercel');
  assert.strictEqual(p2.repo, 'next.js');

  const p3 = parseGithubInput('https://github.com/vercel');
  assert.strictEqual(p3.type, 'profile');
  assert.strictEqual(p3.username, 'vercel');
  console.log('   ✅ URL & profile parser passed all edge cases.');

  // 2. Test Live SSE Streaming Endpoint
  console.log('\n2. Testing Live SSE Stream (/api/v1/github/scan-stream)...');
  const sseRes = await fetch(`${BASE}/github/scan-stream?repoUrl=${encodeURIComponent('https://github.com/expressjs/express?tab=readme-ov-file')}`);
  assert.strictEqual(sseRes.status, 200);
  const sseText = await sseRes.text();
  assert.ok(sseText.includes('event: progress'), 'SSE stream should emit progress events');
  assert.ok(sseText.includes('event: complete'), 'SSE stream should emit complete event');

  // Parse final complete event payload
  const completeMatch = sseText.match(/event: complete\s+data: (.+)/);
  assert.ok(completeMatch, 'Should parse complete payload from SSE');
  const completePayload = JSON.parse(completeMatch[1]).data;
  assert.strictEqual(completePayload.repository.fullName.toLowerCase(), 'expressjs/express');
  assert.ok(completePayload.commits.length > 0, 'Should return live commits');
  assert.ok(completePayload.fileTree.length > 0, 'Should return file tree');
  assert.ok(completePayload.telemetry?.live === true, 'Telemetry must indicate live source');
  console.log(`   ✅ SSE Stream passed! Scanned ${completePayload.repository.fullName} via "${completePayload.telemetry.source}" in ${completePayload.telemetry.latencyMs}ms with ${completePayload.commits.length} live commits.`);

  // 3. Test GitHub User/Org Profile Live Lookup
  console.log('\n3. Testing Live GitHub Profile Lookup (https://github.com/fastapi)...');
  const profRes = await fetch(`${BASE}/github/scan-repo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl: 'https://github.com/fastapi' }),
  });
  const profData = await profRes.json();
  assert.strictEqual(profRes.status, 200);
  assert.strictEqual(profData.type, 'profile');
  assert.ok(Array.isArray(profData.repositories) && profData.repositories.length > 0, 'Should return public repos for @fastapi');
  console.log(`   ✅ Profile lookup passed! Found ${profData.repositories.length} repos for @fastapi (Source: ${profData.source}).`);

  // 4. Test verifyAndImportSkills with Student User AND New Framework Names (FK integrity check!)
  console.log('\n4. Testing Verify & Import Skills DB Persistence (Student + FK Check)...');
  const [studentRows] = await commonPool.query(
    `SELECT u.email FROM users u INNER JOIN students_master sm ON sm.user_id = u.id WHERE u.status = 'ACTIVE' LIMIT 1`
  );
  assert.ok(studentRows.length > 0, 'Need active student in DB for FK verification test');

  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentRows[0].email, password: 'Password@123' }),
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);

  const importRes = await fetch(`${BASE}/github/verify-and-import-skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({
      repoUrl: 'https://github.com/expressjs/express',
      detectedSkills: ['JavaScript', 'Node.js', 'Express.js', 'REST APIs', 'Automated Testing (Jest/Cypress)', 'PyTest'],
      proficiencyLevel: 'ADVANCED',
    }),
  });
  const importData = await importRes.json();
  assert.strictEqual(importRes.status, 200, `Import failed: ${JSON.stringify(importData)}`);
  assert.strictEqual(importData.success, true);
  assert.strictEqual(importData.persistedToStudent, true);
  assert.strictEqual(importData.importedCount, 6);
  console.log(`   ✅ Student DB verification passed! Imported ${importData.importedCount} skills with zero FK errors.`);

  // 5. Test verifyAndImportSkills with Admin Preview Account (No FK crash!)
  console.log('\n5. Testing Verify & Import Skills gracefully in Admin Preview mode...');
  const adminLogin = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'Password@123' }),
  });
  const adminData = await adminLogin.json();

  const adminImportRes = await fetch(`${BASE}/github/verify-and-import-skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminData.token}`,
    },
    body: JSON.stringify({
      repoUrl: 'https://github.com/expressjs/express',
      detectedSkills: ['Node.js', 'Express.js'],
    }),
  });
  const adminImportData = await adminImportRes.json();
  assert.strictEqual(adminImportRes.status, 200);
  assert.strictEqual(adminImportData.success, true);
  console.log(`   ✅ Admin Preview verification passed: "${adminImportData.message}"`);

  console.log('\n=== ALL LIVE GITHUB SCANNER CHECKS PASSED! ===');
  process.exit(0);
}

runLiveSuite().catch((err) => {
  console.error('❌ Live test failed:', err);
  process.exit(1);
});

