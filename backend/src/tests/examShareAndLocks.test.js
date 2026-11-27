const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { app } = require('../server');

let testServer;
let baseUrl = '';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${path}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

before(async () => {
  await new Promise((resolve) => {
    testServer = app.listen(0, () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (testServer) {
    await new Promise((resolve) => testServer.close(resolve));
  }
});

test('Exam Link Sharing & Proctoring Backend Test Suite', async (t) => {
  await t.test('1. Public access: GET /api/v1/assessment/list works without token for shared access', async () => {
    const res = await makeRequest('/api/v1/assessment/list');
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    assert.strictEqual(res.data?.success, true);
    assert.ok(Array.isArray(res.data?.data), 'data should be an array of assessments');
  });

  await t.test('2. Public access: GET /api/v1/assessment/1 returns assessment and question details', async () => {
    const res = await makeRequest('/api/v1/assessment/1');
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    assert.strictEqual(res.data?.success, true);
    assert.ok(res.data?.data?.assessment, 'Should contain assessment object');
    assert.ok(Array.isArray(res.data?.data?.questions), 'Should contain questions array');
  });

  await t.test('3. GET /api/v1/student/quiz/subjects returns active examination list with test IDs', async () => {
    const res = await makeRequest('/api/v1/student/quiz/subjects');
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    assert.strictEqual(res.data?.success, true);
    assert.ok(Array.isArray(res.data?.data), 'data should be an array');
    assert.ok(res.data.data.length >= 1, 'Should contain at least 1 test subject');
    assert.ok(res.data.data.some(s => s.test_id === 1 || s.id === 1), 'Should contain test with id 1');
  });

  await t.test('4. POST /api/v1/student/quiz/attempts/start generates exam session with questions and phases', async () => {
    const res = await makeRequest('/api/v1/student/quiz/attempts/start', {
      method: 'POST',
      body: { testId: 1, subject: 'DSA', duration_minutes: 60 }
    });
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    assert.strictEqual(res.data?.success, true);
    assert.ok(res.data?.data?.attemptId, 'Should return an attemptId');
    assert.ok(Array.isArray(res.data?.data?.questions), 'Should return questions array');
    assert.ok(res.data.data.questions.length > 0, 'Questions array must not be empty');
    assert.ok(res.data.data.phaseBreak !== undefined, 'Should have phaseBreak');
    assert.ok(res.data.data.phase2Break !== undefined, 'Should have phase2Break');
  });

  await t.test('5. POST /api/v1/student/quiz/attempts/submit scores submission with candidate metadata and violations', async () => {
    const res = await makeRequest('/api/v1/student/quiz/attempts/submit', {
      method: 'POST',
      body: {
        attemptId: 12345678,
        candidateName: 'External Candidate',
        rollNumber: 'GUEST2026',
        violations: 1,
        answers: [
          { questionId: 101, selectedOption: 'B' },
          { questionId: 102, selectedOption: 'C' }
        ]
      }
    });
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    assert.strictEqual(res.data?.success, true);
    assert.ok(res.data?.result?.score !== undefined, 'Result should have score');
    assert.strictEqual(res.data.result.violationsRecorded, 1);
    assert.strictEqual(res.data.result.candidateName, 'External Candidate');
  });

  await t.test('6. POST /api/v1/student/quiz/attempts/proctor-log logs proctoring security events', async () => {
    const res = await makeRequest('/api/v1/student/quiz/attempts/proctor-log', {
      method: 'POST',
      body: {
        attemptId: 12345678,
        sessionId: 'session_test_999',
        events: [
          { type: 'FULLSCREEN', detail: 'Entered fullscreen mode', ts: new Date().toISOString() },
          { type: 'VIOLATION', detail: '#1 [high] Exited mandatory fullscreen mode', ts: new Date().toISOString() }
        ]
      }
    });
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    assert.strictEqual(res.data?.success, true);
  });
});

