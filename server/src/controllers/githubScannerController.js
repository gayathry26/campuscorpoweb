const { scanGithubRepository } = require('../services/githubScannerService');
const { queryCommon } = require('../config/db');
const { logAuditEvent } = require('../services/auditService');

/**
 * Scan a public GitHub repository
 * POST /api/v1/github/scan-repo
 */
async function scanRepo(req, res, next) {
  try {
    const { repoUrl, url } = req.body;
    const targetUrl = repoUrl || url;

    if (!targetUrl || !targetUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a GitHub repository URL (e.g. https://github.com/owner/repo).',
      });
    }

    const scanResult = await scanGithubRepository(targetUrl.trim());

    res.json({
      success: true,
      data: scanResult,
      ...scanResult,
    });
  } catch (err) {
    res.status(err.response?.status === 404 ? 404 : 400).json({
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
    const studentId = req.user?.student_id || req.user?.id || 1;
    const verifiedBy = req.user?.id || 1;
    const { repoUrl, detectedSkills = [], proficiencyLevel = 'INTERMEDIATE' } = req.body;

    if (!Array.isArray(detectedSkills) || detectedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills provided for verification.',
      });
    }

    // Retrieve skill catalogue map
    const skillsInDb = await queryCommon('SELECT id, name FROM skills_catalogue');
    const skillMap = new Map();
    skillsInDb.forEach((s) => {
      skillMap.set(s.name.toLowerCase(), s.id);
      skillMap.set(s.id.toLowerCase(), s.id);
    });

    let importedCount = 0;
    const verifiedSkills = [];

    for (const skillName of detectedSkills) {
      // Find matching skill in catalogue
      const cleanName = String(skillName).trim();
      let matchedSkillId = skillMap.get(cleanName.toLowerCase());

      if (!matchedSkillId) {
        // Try loose match
        for (const [key, id] of skillMap.entries()) {
          if (cleanName.toLowerCase().includes(key) || key.includes(cleanName.toLowerCase())) {
            matchedSkillId = id;
            break;
          }
        }
      }

      // If still not found, create a slug id
      if (!matchedSkillId) {
        matchedSkillId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      // Upsert into student_skills
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
        details: { repoUrl, importedCount, skills: detectedSkills },
      });
    }

    res.json({
      success: true,
      message: `Successfully verified and imported ${importedCount} skills from GitHub repository!`,
      importedCount,
      skills: verifiedSkills,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scanRepo,
  verifyAndImportSkills,
};
