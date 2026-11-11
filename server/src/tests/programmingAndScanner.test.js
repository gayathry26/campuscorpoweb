const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { app } = require('../server');
const { detectCompilers, executeSubmission } = require('../services/compilerService');
const { scanGithubRepository, parseRepoUrl } = require('../services/githubScannerService');

let testServer;
let baseUrl = '';

function makePostRequest(path, body, token = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(`${baseUrl}${path}`);
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function makeGetRequest(path, token = '') {
  return new Promise((resolve, reject) => {
    http.get(
      `${baseUrl}${path}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    ).on('error', reject);
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

// ============================================================================
// SUITE 1: PROGRAMMING & COMPILER EXECUTION
// ============================================================================
test('1. Programming & Compiler Execution Suite', async (t) => {
  await t.test('1.1 Compiler detection returns available runtimes', async () => {
    const compilers = await detectCompilers();
    assert.ok(compilers.python.available, 'Python runtime must be available');
    assert.ok(compilers.javascript.available, 'Node.js/JavaScript runtime must be available');
    assert.ok(compilers.java.available, 'Java runtime must be available');
  });

  await t.test('1.2 Python direct code execution with stdout and return code', async () => {
    const result = await executeSubmission({
      language: 'python',
      sourceCode: 'import sys\nprint("Hello " + sys.stdin.read().strip())',
      input: 'CampusCorp',
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'ACCEPTED');
    assert.strictEqual(result.output.trim(), 'Hello CampusCorp');
    assert.ok(result.executionTimeMs >= 0);
  });

  await t.test('1.3 JavaScript direct code execution with stdout', async () => {
    const result = await executeSubmission({
      language: 'javascript',
      sourceCode: 'console.log(JSON.stringify({ calculated: 15 * 3 }));',
      input: '',
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'ACCEPTED');
    assert.ok(result.output.includes('{"calculated":45}'));
  });

  await t.test('1.4 Java direct code execution with auto-class extraction', async () => {
    const result = await executeSubmission({
      language: 'java',
      sourceCode: 'public class Solution { public static void main(String[] args) { System.out.println("Java OK: " + (50 * 2)); } }',
      input: '',
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'ACCEPTED');
    assert.ok(result.output.includes('Java OK: 100'));
  });

  await t.test('1.5 Multi test cases evaluation compares expected vs actual and computes score', async () => {
    const result = await executeSubmission({
      language: 'python',
      sourceCode: 'import sys\nx = int(sys.stdin.read().strip())\nprint(x * x)',
      testCases: [
        { input: '4', output: '16' },
        { input: '9', output: '81' },
        { input: '3', output: '10' }, // Intentional wrong answer
      ],
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.totalTestCases, 3);
    assert.strictEqual(result.passedTestCases, 2);
    assert.strictEqual(result.score, 67); // 2/3 = 67%
    assert.strictEqual(result.status, 'WRONG_ANSWER');
    assert.strictEqual(result.results.length, 3);
    assert.strictEqual(result.results[0].passed, true);
    assert.strictEqual(result.results[1].passed, true);
    assert.strictEqual(result.results[2].passed, false);
  });

  await t.test('1.6 POST /api/v1/assessment/run executes code in sandbox', async () => {
    const res = await makePostRequest('/api/v1/assessment/run', {
      language: 'python',
      source_code: 'print("Testing Assessment Sandbox API")',
      input: '',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.output.includes('Testing Assessment Sandbox API'));
  });

  await t.test('1.7 POST /api/v1/student/compiler/run matches ExamScreen runner interface', async () => {
    const res = await makePostRequest('/api/v1/student/compiler/run', {
      language: 'python',
      code: 'import sys\nprint(sys.stdin.read().strip().upper())',
      testCases: [
        { input: 'hello', output: 'HELLO' },
        { input: 'world', output: 'WORLD' },
      ],
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.passedTestCases, 2);
    assert.strictEqual(res.data.results.length, 2);
    assert.strictEqual(res.data.results[0].passed, true);
    assert.strictEqual(res.data.results[1].passed, true);
  });
});

// ============================================================================
// SUITE 2: INTERVIEW THING & WEBRTC
// ============================================================================
test('2. Video Call & Mock Interview System Suite', async (t) => {
  // Login to acquire token
  const authRes = await makePostRequest('/api/v1/auth/login', {
    email: 'admin@college.edu',
    password: 'Password@123',
  });
  assert.strictEqual(authRes.status, 200);
  const token = authRes.data.token;
  assert.ok(token, 'Should obtain auth token');

  await t.test('2.1 GET /api/v1/mock-interviews/ice-servers returns STUN endpoints', async () => {
    const res = await makeGetRequest('/api/v1/mock-interviews/ice-servers', token);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const iceServers = res.data.data?.iceServers || res.data.iceServers;
    assert.ok(Array.isArray(iceServers));
    assert.ok(iceServers.length > 0);
  });

  await t.test('2.2 GET /api/v1/mock-interviews returns active meetings list', async () => {
    const res = await makeGetRequest('/api/v1/mock-interviews', token);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length >= 2, 'Should have pre-seeded mock interviews');
  });

  await t.test('2.3 GET /api/v1/mock-interviews/gen-meet-x94 retrieves single room details', async () => {
    const res = await makeGetRequest('/api/v1/mock-interviews/gen-meet-x94', token);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.room_code, 'gen-meet-x94');
    assert.ok(res.data.data.title);
  });

  await t.test('2.4 POST /api/v1/ai/interview-questions generates domain technical questions', async () => {
    const res = await makePostRequest('/api/v1/ai/interview-questions', {
      topic: 'Data Structures and Algorithms',
      difficulty: 'Intermediate',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.questions));
    assert.ok(res.data.questions.length > 0);
    assert.ok(res.data.questions[0].question);
  });
});

// ============================================================================
// SUITE 3: GITHUB REPO SCANNING THING
// ============================================================================
test('3. GitHub Repository Scanner Suite', async (t) => {
  await t.test('3.1 URL parser normalizes different GitHub URL formats', async () => {
    const p1 = parseRepoUrl('https://github.com/facebook/react');
    assert.strictEqual(p1.owner, 'facebook');
    assert.strictEqual(p1.repo, 'react');

    const p2 = parseRepoUrl('github.com/fastapi/fastapi/');
    assert.strictEqual(p2.owner, 'fastapi');
    assert.strictEqual(p2.repo, 'fastapi');

    const p3 = parseRepoUrl('torvalds/linux.git');
    assert.strictEqual(p3.owner, 'torvalds');
    assert.strictEqual(p3.repo, 'linux');
  });

  await t.test('3.2 scanGithubRepository parses real GitHub repository', async () => {
    const result = await scanGithubRepository('https://github.com/facebook/react');
    assert.strictEqual(result.success, true);
    assert.ok(result.repository.fullName.includes('react'));
    assert.ok(result.repository.stars >= 0);
    assert.ok(result.codeQuality.score > 0);
    assert.ok(Array.isArray(result.languages.breakdown));
    assert.ok(result.detectedSkills.length > 0);
    assert.ok(Array.isArray(result.matchedRoles));
  });

  await t.test('3.3 POST /api/v1/github/scan-repo API returns complete scan payload', async () => {
    const res = await makePostRequest('/api/v1/github/scan-repo', {
      repoUrl: 'https://github.com/facebook/react',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.repository);
    assert.ok(res.data.codeQuality);
    assert.ok(res.data.languages);
    assert.ok(res.data.detectedSkills);
  });

  await t.test('3.4 POST /api/v1/github/verify-and-import-skills imports skills into DB', async () => {
    const authRes = await makePostRequest('/api/v1/auth/login', {
      email: 'admin@college.edu',
      password: 'Password@123',
    });
    const token = authRes.data.token;

    const res = await makePostRequest(
      '/api/v1/github/verify-and-import-skills',
      {
        repoUrl: 'https://github.com/aditya/fullstack-project',
        detectedSkills: ['React.js', 'Node.js', 'Python'],
        proficiencyLevel: 'ADVANCED',
      },
      token
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.importedCount >= 3);
  });
});
