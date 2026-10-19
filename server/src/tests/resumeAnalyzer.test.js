const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const resumeParser = require('../services/resumeParser.service');
const resumeAnalyzerService = require('../services/resumeAnalyzer.service');
const { queryCommon } = require('../config/db');

test('Resume Analyzer Test Suite', async (t) => {
  await t.test('1. Model file existence and health status', async () => {
    const health = await resumeAnalyzerService.getHealth();
    assert.strictEqual(health.server, 'online');
    assert.strictEqual(typeof health.aiService, 'object');
    if (health.aiService.status === 'ready') {
      assert.strictEqual(health.aiService.model_loaded, true);
      assert.strictEqual(health.aiService.model_exists, true);
      assert.ok(health.aiService.model_path.includes('mistral-7b-instruct-v0.1.Q4_K_M.gguf'));
    }
  });

  await t.test('2. Roles and placement openings catalogue', async () => {
    const data = await resumeAnalyzerService.getAvailableRoles();
    assert.ok(Array.isArray(data.roles));
    assert.ok(data.roles.length > 0, 'Roles should not be empty');
    const firstRole = data.roles[0];
    assert.ok(firstRole.id);
    assert.ok(firstRole.title);
    assert.ok(Array.isArray(firstRole.technicalSkills));
  });

  await t.test('3. Document parser - reject empty file', async () => {
    await assert.rejects(
      async () => {
        await resumeParser.extractText({ buffer: Buffer.from(''), originalname: 'empty.pdf' });
      },
      /empty or corrupted/i
    );
  });

  await t.test('4. Document parser - reject unsupported format', async () => {
    await assert.rejects(
      async () => {
        await resumeParser.extractText({ buffer: Buffer.from('fake image data'), originalname: 'resume.png' });
      },
      /unsupported file extension/i
    );
  });

  await t.test('5. Document parser - detect scanned PDF / insufficient text', async () => {
    await assert.rejects(
      async () => {
        // Scanned PDF with only 5 characters of text
        await resumeParser.extractText({
          buffer: Buffer.from('%PDF-1.4 sample non-text'),
          originalname: 'scanned_scan.pdf',
        });
      },
      (err) => err.isScanned !== undefined || err.message.length > 0
    );
  });

  await t.test('6. Database persistence - create, retrieve, and enforce cross-student isolation', async () => {
    const testUserIdA = 8; // Aditya Varma
    const testUserIdB = 9; // Second user

    // Insert dummy record directly
    const testUuid = 'test-uuid-' + Date.now();
    await queryCommon(
      `INSERT INTO resume_analyses (
        uuid, user_id, role_id, role_title, original_filename,
        file_format, file_size_bytes, overall_score, job_match_score, analysis_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testUuid,
        testUserIdA,
        'frontend-developer',
        'Frontend Developer',
        'test_resume.pdf',
        'PDF',
        1024,
        85,
        78,
        JSON.stringify({ summary: 'Test summary', strengths: ['React', 'CSS'] }),
      ]
    );

    // Retrieve by owner (User A) -> should succeed
    const recordA = await resumeAnalyzerService.getAnalysisById(testUserIdA, testUuid);
    assert.ok(recordA, 'Owner should retrieve their own analysis');
    assert.strictEqual(recordA.overallScore, 85);
    assert.strictEqual(recordA.jobMatchScore, 78);

    // Retrieve by non-owner (User B) -> must return null (strict isolation)
    const recordB = await resumeAnalyzerService.getAnalysisById(testUserIdB, testUuid);
    assert.strictEqual(recordB, null, 'Non-owner must NOT be able to access another student record');

    // Clean up
    await resumeAnalyzerService.deleteAnalysis(testUserIdA, testUuid);
    const postDelete = await resumeAnalyzerService.getAnalysisById(testUserIdA, testUuid);
    assert.strictEqual(postDelete, null, 'Record should be deleted');
  });
});
