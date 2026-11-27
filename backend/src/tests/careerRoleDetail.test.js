const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { app } = require('../server');

let testServer;
let baseUrl = '';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
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

test('Career Role Details Dedicated API Suite', async (t) => {

  await t.test('1. Stats endpoint returns verified 38 domains and 114 roles', async () => {
    const res = await makeRequest('/api/v1/career/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.totalDomains, 38, 'Should have 38 domains');
    assert.strictEqual(res.data.data.totalRoles, 114, 'Should have 114 roles');
  });

  await t.test('2. List domains returns 38 catalogue domains', async () => {
    const res = await makeRequest('/api/v1/career/domains');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.domains.length, 38, 'Domain catalogue should contain exactly 38 domains');
  });

  await t.test('3. Dedicated domain details page returns 200 with roles and core tech', async () => {
    const res = await makeRequest('/api/v1/career/domains/cloud-computing-cloud-engineering');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.domain.id, 'cloud-computing-cloud-engineering');
    assert.strictEqual(res.data.domain.name, 'Cloud Computing & Cloud Engineering');
    assert.ok(Array.isArray(res.data.roles));
    assert.ok(res.data.roles.length >= 3, 'Domain should have at least 3 representative roles');
    assert.ok(Array.isArray(res.data.domain.coreTechnologies));
  });

  await t.test('4. Dedicated role details page returns 200 with 7-dimension specifications', async () => {
    const res = await makeRequest('/api/v1/career/roles/cloud-engineer');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.id, 'cloud-engineer');
    assert.strictEqual(res.data.data.title, 'Cloud Infrastructure & Solutions Engineer');
    assert.ok(Array.isArray(res.data.data.responsibilities));
    assert.ok(res.data.data.responsibilities.length > 0);
    assert.ok(Array.isArray(res.data.data.technicalSkills));
    assert.ok(res.data.data.technicalSkills.length > 0);
    assert.ok(Array.isArray(res.data.data.tools));
    assert.ok(res.data.data.tools.length > 0);
    assert.ok(res.data.data.domain);
  });

  await t.test('5. Domain + Role combined route returns 200', async () => {
    const res = await makeRequest('/api/v1/career/domains/generative-ai-llm-engineering/roles/generative-ai-engineer');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.id, 'generative-ai-engineer');
    assert.strictEqual(res.data.data.title, 'Generative AI & LLM Application Engineer');
  });

  await t.test('6. Role dedicated skills endpoint returns 200 with requirements and tags', async () => {
    const res = await makeRequest('/api/v1/career/roles/ai-agent-architect/skills');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.technicalSkills));
    assert.ok(Array.isArray(res.data.data.tools));
  });

  await t.test('7. Role dedicated roadmap endpoint returns 200 with structured 5 stages', async () => {
    const res = await makeRequest('/api/v1/career/roles/ai-agent-architect/roadmap');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.stages));
    assert.strictEqual(res.data.data.stages.length, 5, 'Should provide 5 learning stages');
  });

  await t.test('8. Role dedicated projects endpoint returns 200 with tiered capstones', async () => {
    const res = await makeRequest('/api/v1/career/roles/ai-agent-architect/projects');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.projects.beginner);
    assert.ok(res.data.data.projects.intermediate);
    assert.ok(res.data.data.projects.advanced);
  });

  await t.test('9. Role comparison API evaluates multiple roles side-by-side', async () => {
    const res = await makeRequest('/api/v1/career/compare?roles=generative-ai-engineer,cloud-engineer');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.roles.length, 2);
  });

  await t.test('10. Non-existent role returns 404 with friendly message', async () => {
    const res = await makeRequest('/api/v1/career/roles/non-existent-role-xyz');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.message.includes('not found'));
  });
});
