const test = require('node:test');
const assert = require('node:assert');
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
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

test('Career Role Details Dedicated API Suite', async (t) => {
  await t.test('1. Cloud Engineer role returns 200 with full specifications', async () => {
    const res = await makeRequest('/api/v1/career/domains/cloud-computing-devops/roles/cloud-engineer');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.id, 'cloud-engineer');
    assert.strictEqual(res.data.data.title, 'Cloud Engineer');
    assert.strictEqual(res.data.data.category, 'Cloud Computing & DevOps');
    assert.ok(Array.isArray(res.data.data.responsibilities));
    assert.ok(res.data.data.responsibilities.length > 0);
    assert.ok(Array.isArray(res.data.data.technicalSkills));
    assert.ok(res.data.data.technicalSkills.length > 0);
    assert.ok(Array.isArray(res.data.data.tools));
    assert.ok(res.data.data.tools.length > 0);
    assert.ok(res.data.data.domain);
    assert.strictEqual(res.data.data.domain.name, 'Cloud Computing & DevOps');
  });

  await t.test('2. DevOps Engineer role returns 200 with respective specifications', async () => {
    const res = await makeRequest('/api/v1/career/domains/cloud-computing-devops/roles/devops-engineer');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.id, 'devops-engineer');
    assert.strictEqual(res.data.data.title, 'DevOps Engineer');
    assert.strictEqual(res.data.data.category, 'Cloud Computing & DevOps');
  });

  await t.test('3. Software Tester role under testing-quality-assurance returns 200', async () => {
    const res = await makeRequest('/api/v1/career/domains/testing-quality-assurance/roles/software-tester');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.id, 'software-tester');
    assert.strictEqual(res.data.data.category, 'Testing & Quality Assurance');
  });

  await t.test('4. Non-existent role returns 404 with friendly error message', async () => {
    const res = await makeRequest('/api/v1/career/domains/cloud-computing-devops/roles/non-existent-role-xyz');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.message.includes('not found'));
  });
});
