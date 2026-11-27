const http = require('http');
const { app } = require('./server');
const { checkPlatformHealth } = require('./config/platformDb');
const { queryPlatform } = require('./config/platformDb');
const { queryTenant } = require('./config/tenantConnectionManager');

async function runPhase6Tests() {
  console.log('================================================================');
  console.log('🧪 [PHASE 6 TEST] Multi-Tenant Auth, RBAC, Protected Routes & Revocation');
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
    // TEST 1: TIER SEPARATION (PLATFORM vs COLLEGE AUTH ISOLATION)
    // =================================================================
    console.log('\n--- Test 1: Global vs College Tier Separation ---');

    // 1a. Platform Super Admin Login
    const platformLoginRes = await fetch(`${baseUrl}/api/v1/platform/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'platform.admin@campuscorp.io',
        password: 'Password@123',
      }),
    });
    const platformLoginData = await platformLoginRes.json();
    if (!platformLoginData.token) {
      throw new Error('Platform login failed: ' + JSON.stringify(platformLoginData));
    }
    const platformToken = platformLoginData.token;
    console.log('✓ Platform Super Admin authenticated.');

    // 1b. College Admin Login (KCT)
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
    console.log('✓ KCT College Administrator authenticated.');

    // 1c. College token cannot access Platform Admin APIs
    const collegeToPlatformRes = await fetch(`${baseUrl}/api/v1/platform/overview`, {
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    console.log(`✓ College token rejected on Platform API: HTTP ${collegeToPlatformRes.status}`);
    if (collegeToPlatformRes.status !== 403 && collegeToPlatformRes.status !== 401) {
      throw new Error('College token should NOT be able to access Platform API!');
    }

    // 1d. Platform token cannot access College Admin APIs directly
    const platformToCollegeRes = await fetch(`${baseUrl}/api/v1/college-admin/profile`, {
      headers: { 'Authorization': `Bearer ${platformToken}` },
    });
    console.log(`✓ Platform token rejected on College API: HTTP ${platformToCollegeRes.status}`);
    if (platformToCollegeRes.status !== 401 && platformToCollegeRes.status !== 403) {
      throw new Error('Platform token should NOT be able to access College API without institutional membership!');
    }

    // =================================================================
    // TEST 2: RBAC ENFORCEMENT & UNAUTHORIZED ROLE REJECTION
    // =================================================================
    console.log('\n--- Test 2: Institutional RBAC & Protected Routes ---');

    // Create a demo student in KCT database if not exists
    const [kctColleges] = await queryPlatform("SELECT id FROM colleges WHERE code = 'KCT'");
    const kctCollegeId = kctColleges.id;

    // Check if demo student exists in KCT, or insert
    const existingStudent = await queryTenant('KCT', "SELECT id FROM users WHERE email = 'student.test@kct.ac.in'");
    let studentId;
    if (existingStudent.length === 0) {
      const studentInsert = await queryTenant(
        'KCT',
        `INSERT INTO users (uuid, email, password_hash, role_id, role_name, first_name, last_name, status)
         VALUES (UUID(), 'student.test@kct.ac.in', 'hashed_pw', 3, 'STUDENT', 'Test', 'Student', 'ACTIVE')`
      );
      studentId = studentInsert.insertId;
    } else {
      studentId = existingStudent[0].id;
    }

    // Sign a mock student token for KCT
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_placement_jwt_secret_key_2026_production_grade';
    const studentToken = jwt.sign(
      {
        userId: studentId,
        roleName: 'STUDENT',
        collegeId: kctCollegeId,
        collegeCode: 'KCT',
        dbName: 'campuscorp_college_kct',
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Student attempting to access protected College Admin endpoint (POST /college-admin/departments)
    const unauthorizedDeptRes = await fetch(`${baseUrl}/api/v1/college-admin/departments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dept_code: 'HACK', dept_name: 'Unauthorized Dept' }),
    });
    console.log(`✓ Student role blocked from College Admin action: HTTP ${unauthorizedDeptRes.status}`);
    if (unauthorizedDeptRes.status !== 403) {
      throw new Error('Student role should be rejected with 403 Forbidden!');
    }

    // =================================================================
    // TEST 3: SESSION REVOCATION - SELF LOGOUT
    // =================================================================
    console.log('\n--- Test 3: Session Revocation (Self Logout) ---');

    // Verify KCT token works first
    const meBeforeLogout = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    const meBeforeData = await meBeforeLogout.json();
    console.log(`✓ KCT Token active before logout: HTTP ${meBeforeLogout.status}:`, JSON.stringify(meBeforeData));
    if (meBeforeLogout.status !== 200) throw new Error('Expected 200 for active token');

    // Call Logout endpoint
    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    const logoutData = await logoutRes.json();
    console.log(`✓ Logout called: HTTP ${logoutRes.status}:`, logoutData.message);

    // Verify KCT token is now revoked
    const meAfterLogout = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${kctToken}` },
    });
    console.log(`✓ KCT Token immediately blocked after logout: HTTP ${meAfterLogout.status}`);
    if (meAfterLogout.status !== 401) {
      throw new Error('Logged out token should be rejected with 401!');
    }

    // =================================================================
    // TEST 4: EMERGENCY COLLEGE-WIDE KILLSWITCH BY PLATFORM SUPER ADMIN
    // =================================================================
    console.log('\n--- Test 4: Emergency College Session Killswitch ---');

    // Login fresh KCT Admin to get a fresh token
    const freshKctLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kct.ac.in',
        password: 'CollegeAdmin@2026',
        collegeCode: 'KCT',
      }),
    });
    const freshKctData = await freshKctLogin.json();
    if (!freshKctData.token) throw new Error('Fresh KCT login failed: ' + JSON.stringify(freshKctData));
    const freshKctToken = freshKctData.token;

    // Verify fresh token works
    const profileResBeforeKill = await fetch(`${baseUrl}/api/v1/college-admin/profile`, {
      headers: { 'Authorization': `Bearer ${freshKctToken}` },
    });
    const profileDataBeforeKill = await profileResBeforeKill.json();
    console.log(`✓ Fresh KCT session active: HTTP ${profileResBeforeKill.status}:`, JSON.stringify(profileDataBeforeKill));
    if (profileResBeforeKill.status !== 200) throw new Error('Fresh session should work!');

    // Wait 1000ms so iat < killswitch timestamp
    await new Promise((r) => setTimeout(r, 1100));

    // Platform Super Admin executes emergency college killswitch
    const killswitchRes = await fetch(`${baseUrl}/api/v1/platform/colleges/${kctCollegeId}/revoke-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${platformToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Emergency institutional killswitch test' }),
    });
    const killswitchData = await killswitchRes.json();
    console.log(`✓ Platform Super Admin executed emergency killswitch: HTTP ${killswitchRes.status}:`, killswitchData.message);

    // Immediately test freshKctToken -> MUST be revoked!
    const profileResAfterKill = await fetch(`${baseUrl}/api/v1/college-admin/profile`, {
      headers: { 'Authorization': `Bearer ${freshKctToken}` },
    });
    console.log(`✓ KCT token blocked by college-wide killswitch: HTTP ${profileResAfterKill.status}`);
    if (profileResAfterKill.status !== 401) {
      throw new Error('College token should be invalidated by emergency killswitch!');
    }

    // =================================================================
    // TEST 5: COLLEGE ADMIN USER-LEVEL SESSION REVOCATION
    // =================================================================
    console.log('\n--- Test 5: College Admin User-Level Revocation ---');

    // Wait 1.2s so new tokens are issued after the college killswitch second
    await new Promise((r) => setTimeout(r, 1200));

    // Log in fresh KCT Admin after killswitch
    const postKillAdminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kct.ac.in',
        password: 'CollegeAdmin@2026',
        collegeCode: 'KCT',
      }),
    });
    const postKillAdminData = await postKillAdminLogin.json();
    if (!postKillAdminData.token) throw new Error('Post kill login failed: ' + JSON.stringify(postKillAdminData));
    const postKillAdminToken = postKillAdminData.token;

    // Sign a fresh student token
    const crypto = require('crypto');
    const freshStudentToken = jwt.sign(
      {
        jti: crypto.randomUUID(),
        userId: studentId,
        roleName: 'STUDENT',
        collegeId: kctCollegeId,
        collegeCode: 'KCT',
        dbName: 'campuscorp_college_kct',
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Verify student token works
    const studentMeBefore = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${freshStudentToken}` },
    });
    console.log(`✓ Student token active: HTTP ${studentMeBefore.status}`);
    if (studentMeBefore.status !== 200) throw new Error('Student token should work!');

    await new Promise((r) => setTimeout(r, 1100));

    // College Admin revokes student's active sessions
    const revokeUserRes = await fetch(`${baseUrl}/api/v1/college-admin/users/${studentId}/revoke-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${postKillAdminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Student account disciplinary action' }),
    });
    const revokeUserData = await revokeUserRes.json();
    console.log(`✓ College Admin revoked student sessions: HTTP ${revokeUserRes.status}:`, revokeUserData.message);

    // Verify student token is blocked
    const studentMeAfter = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${freshStudentToken}` },
    });
    console.log(`✓ Student token blocked after user-level revocation: HTTP ${studentMeAfter.status}`);
    if (studentMeAfter.status !== 401) {
      throw new Error('Student token should be invalidated by user-level revocation!');
    }

    // Verify College Admin token is STILL ACTIVE (proves targeted user isolation)
    const adminMeStillActive = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${postKillAdminToken}` },
    });
    console.log(`✓ College Admin session remains unaffected: HTTP ${adminMeStillActive.status}`);
    if (adminMeStillActive.status !== 200) {
      throw new Error('Admin session should remain active when only student was revoked!');
    }

    console.log('\n================================================================');
    console.log('🎉 [PHASE 6 COMPLETE] Multi-Tenant Auth, RBAC & Revocation Fully Verified!');
    console.log('================================================================');
  } finally {
    server.close();
  }
}

runPhase6Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ [PHASE 6 SUITE FAILED]:', err);
    process.exit(1);
  });
