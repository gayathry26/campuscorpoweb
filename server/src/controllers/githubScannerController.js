const {
  scanGithubRepository,
  fetchUserRepositories,
  parseGithubInput,
} = require('../services/githubScannerService');
const { queryCommon } = require('../config/db');
const { logAuditEvent } = require('../services/auditService');

/**
 * Scan a public GitHub repository OR GitHub user profile live
 * POST /api/v1/github/scan-repo
 */
async function scanRepo(req, res) {
  try {
    const { repoUrl, url, githubToken } = req.body;
    const targetUrl = repoUrl || url;

    if (!targetUrl || !String(targetUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a GitHub repository URL (e.g. https://github.com/owner/repo) or username.',
      });
    }

    const parsed = parseGithubInput(String(targetUrl).trim());
    if (parsed.type === 'profile') {
      const profileResult = await fetchUserRepositories(parsed.username, { githubToken });
      return res.json({
        success: true,
        type: 'profile',
        data: profileResult,
        ...profileResult,
      });
    }

    const scanResult = await scanGithubRepository(String(targetUrl).trim(), { githubToken });

    res.json({
      success: true,
      type: 'repo',
      data: scanResult,
      ...scanResult,
    });
  } catch (err) {
    res.status(err.response?.status === 404 || err.message?.includes('not found') ? 404 : 400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Real-Time SSE Live Repository Scan Stream
 * GET /api/v1/github/scan-stream?repoUrl=...
 */
async function scanRepoLiveStream(req, res) {
  const targetUrl = req.query.repoUrl || req.query.url;
  const githubToken = req.query.githubToken || req.headers['x-github-token'];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const sendEvent = (event, payload) => {
    if (!res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    }
  };

  if (!targetUrl || !String(targetUrl).trim()) {
    sendEvent('scan_error', { message: 'Please provide a GitHub repository URL or username.' });
    return res.end();
  }

  try {
    const parsed = parseGithubInput(String(targetUrl).trim());

    if (parsed.type === 'profile') {
      sendEvent('progress', { step: 1, totalSteps: 2, label: `Fetching live public repositories for @${parsed.username}...`, status: 'active' });
      const profileResult = await fetchUserRepositories(parsed.username, { githubToken });
      sendEvent('progress', { step: 2, totalSteps: 2, label: `Loaded ${profileResult.repositories.length} live repositories.`, status: 'done' });
      sendEvent('complete', { type: 'profile', data: profileResult });
      return res.end();
    }

    const scanResult = await scanGithubRepository(String(targetUrl).trim(), {
      githubToken,
      onProgress: (stepInfo) => sendEvent('progress', stepInfo),
    });

    sendEvent('complete', { type: 'repo', data: scanResult });
    return res.end();
  } catch (err) {
    sendEvent('scan_error', { message: err.message || 'Live scan failed.' });
    return res.end();
  }
}

/**
 * Get public repositories for a GitHub username
 * GET /api/v1/github/user-repos/:username
 */
async function getUserRepositories(req, res) {
  try {
    const { username } = req.params;
    const githubToken = req.query.githubToken || req.headers['x-github-token'];
    const result = await fetchUserRepositories(username, { githubToken });
    res.json({ success: true, data: result, ...result });
  } catch (err) {
    res.status(err.message?.includes('not found') ? 404 : 400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Verify & Import Detected Skills to Student Profile
 * POST /api/v1/github/verify-and-import-skills
 */
async function verifyAndImportSkills(req, res, next) {
  try {
    const verifiedBy = req.user?.id || 1;
    const { repoUrl, detectedSkills = [], proficiencyLevel = 'INTERMEDIATE' } = req.body;

    if (!Array.isArray(detectedSkills) || detectedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills provided for verification.',
      });
    }

    // Safely resolve a real student_id present in students_master
    let studentId = req.user?.student_id || null;
    if (!studentId && req.user?.id) {
      const rows = await queryCommon('SELECT id FROM students_master WHERE user_id = ? LIMIT 1', [req.user.id]).catch(() => []);
      if (rows.length > 0) studentId = rows[0].id;
    }

    // Double check studentId actually exists before FK write
    let canPersistToStudentDb = false;
    if (studentId) {
      const checkRow = await queryCommon('SELECT id FROM students_master WHERE id = ? LIMIT 1', [studentId]).catch(() => []);
      if (checkRow.length > 0) {
        canPersistToStudentDb = true;
      }
    }

    // Build skill catalogue lookup with common synonyms
    const skillsInDb = await queryCommon('SELECT id, name FROM skills_catalogue').catch(() => []);
    const skillMap = new Map();
    skillsInDb.forEach((s) => {
      skillMap.set(s.name.toLowerCase(), s.id);
      skillMap.set(s.id.toLowerCase(), s.id);
    });

    const SYNONYM_MAP = {
      'html5': 'html',
      'css3': 'css',
      'javascript (es6+)': 'javascript',
      'golang': 'golang',
      'go (golang)': 'golang',
      'react.js': 'react',
      'node.js': 'node-js',
      'next.js': 'next-js',
      'vue.js': 'vue-js',
      'nest.js': 'nest-js',
      'express.js': 'express-js',
      'tailwind css': 'tailwind-css',
      'automated testing (jest/cypress)': 'automated-testing',
      'automated testing / jest / cypress': 'automated-testing',
      'scikit-learn': 'scikit-learn',
      'github actions': 'github-actions',
    };

    let importedCount = 0;
    const verifiedSkills = [];

    for (const skillName of detectedSkills) {
      const cleanName = String(skillName).trim();
      if (!cleanName) continue;
      const lowerName = cleanName.toLowerCase();

      let matchedSkillId = SYNONYM_MAP[lowerName] || skillMap.get(lowerName);

      if (!matchedSkillId) {
        for (const [key, id] of skillMap.entries()) {
          if (lowerName === key || (key.length > 3 && lowerName.includes(key))) {
            matchedSkillId = id;
            break;
          }
        }
      }

      if (!matchedSkillId) {
        matchedSkillId = lowerName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'skill-item';
      }

      if (canPersistToStudentDb) {
        // Ensure skill exists in skills_catalogue first so student_skills FK never fails
        if (!skillMap.has(matchedSkillId) && !skillsInDb.some((s) => s.id === matchedSkillId)) {
          await queryCommon(
            `INSERT IGNORE INTO skills_catalogue (id, name, category) VALUES (?, ?, 'Technical & Frameworks')`,
            [matchedSkillId, cleanName.slice(0, 100)]
          ).catch(() => {});
          skillMap.set(matchedSkillId, matchedSkillId);
        }

        await queryCommon(
          `INSERT INTO student_skills (student_id, skill_id, proficiency_level, evidence_type, evidence_url, is_verified, verified_by, verified_at, updated_at)
           VALUES (?, ?, ?, 'GITHUB', ?, 1, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE
              proficiency_level = VALUES(proficiency_level),
              evidence_type = 'GITHUB',
              evidence_url = VALUES(evidence_url),
              is_verified = 1,
              verified_by = VALUES(verified_by),
              verified_at = NOW(),
              updated_at = NOW()`,
          [studentId, matchedSkillId, proficiencyLevel, repoUrl || 'https://github.com', verifiedBy]
        );
      }

      importedCount++;
      verifiedSkills.push({
        skillId: matchedSkillId,
        name: cleanName,
        isVerified: true,
        evidenceType: 'GITHUB',
        evidenceUrl: repoUrl,
      });
    }

    if (req.user?.id) {
      await logAuditEvent({
        userId: req.user.id,
        action: 'GITHUB_REPO_SKILL_VERIFICATION',
        module: 'SKILL_ANALYZER',
        details: { repoUrl, importedCount, skills: detectedSkills, persistedToStudent: canPersistToStudentDb },
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: canPersistToStudentDb
        ? `Successfully verified and imported ${importedCount} skills from GitHub repository!`
        : `Verified ${importedCount} repository skills (Admin/Faculty preview mode; student profile required for transcript write).`,
      importedCount,
      persistedToStudent: canPersistToStudentDb,
      skills: verifiedSkills,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scanRepo,
  scanRepoLiveStream,
  getUserRepositories,
  verifyAndImportSkills,
};
