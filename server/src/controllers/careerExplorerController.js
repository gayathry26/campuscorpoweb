const { queryCommon } = require('../config/db');

/**
 * Format a raw SQL career_roles row into the frontend role object structure
 */
function formatRoleRow(row) {
  if (!row) return null;

  const parseJsonSafe = (val, fallback = []) => {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return fallback;
    }
  };

  const stats = parseJsonSafe(row.stats, {
    averageSalary: '₹6.0 - ₹18.0 LPA',
    jobOpenings: '30,000+ Active Roles',
    growthRate: '+15% YoY Growth',
  });

  let minLpa = null;
  let maxLpa = null;
  if (stats && stats.averageSalary) {
    const m = String(stats.averageSalary).match(/([\d.]+)\s*-\s*[^\d]*([\d.]+)/);
    if (m) {
      minLpa = parseFloat(m[1]);
      maxLpa = parseFloat(m[2]);
    }
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: parseJsonSafe(row.tags, []),
    shortDescription: row.short_description || '',
    scope: row.scope || '',
    responsibilities: parseJsonSafe(row.responsibilities, []),
    technicalSkills: parseJsonSafe(row.technical_skills, []),
    softSkills: parseJsonSafe(row.soft_skills, []),
    tools: parseJsonSafe(row.tools, []),
    stats: {
      ...stats,
      minLpa,
      maxLpa,
      averageSalary: stats.averageSalary || 'Competitive Market Rate',
    },
    projects: parseJsonSafe(row.projects, {
      beginner: [],
      intermediate: [],
      advanced: [],
    }),
    certifications: parseJsonSafe(row.certifications, []),
    roadmap: parseJsonSafe(row.roadmap, []),
    interviewQuestions: parseJsonSafe(row.interview_questions, []),
    topHiringCompanies: parseJsonSafe(row.top_hiring_companies, []),
    qualifications: parseJsonSafe(row.qualifications, null),
    prerequisites: parseJsonSafe(row.prerequisites, null),
    sortOrder: row.sort_order || 0,
  };
}

/**
 * GET /api/v1/career/domains
 * Fetch all career domain categories with role counts from SQL
 */
async function getDomains(req, res) {
  try {
    const sql = `
      SELECT cd.*, COUNT(cr.id) AS role_count
      FROM career_domains cd
      LEFT JOIN career_roles cr ON cr.category = cd.name
      GROUP BY cd.id, cd.name, cd.description, cd.icon, cd.sort_order, cd.created_at
      ORDER BY cd.sort_order ASC, cd.name ASC
    `;
    const rows = await queryCommon(sql);

    const domains = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      icon: r.icon,
      roleCount: Number(r.role_count || 0),
    }));

    // Add 'All Domains' virtual summary entry
    const totalRoles = domains.reduce((sum, d) => sum + d.roleCount, 0);

    return res.json({
      success: true,
      data: {
        categories: ['All Domains', ...domains.map((d) => d.name)],
        domains,
        totalRoles,
      },
    });
  } catch (error) {
    console.error('Error in getDomains:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career domains from SQL database.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/domains/:slug
 * Fetch single career domain by slug/ID with its specific roles and domain statistics
 */
async function getDomainBySlug(req, res) {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, message: 'Domain slug is required.' });
    }

    // Try finding by ID, slugified name, or exact name
    const domainRows = await queryCommon(
      `SELECT * FROM career_domains WHERE id = ? OR LOWER(REPLACE(REPLACE(name, ' & ', '-'), ' ', '-')) = ? OR LOWER(name) = ? LIMIT 1`,
      [slug, slug.toLowerCase(), slug.toLowerCase()]
    );

    if (domainRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Career domain '${slug}' not found.`,
      });
    }

    const domainRow = domainRows[0];
    const domainName = domainRow.name;

    // Fetch roles belonging exclusively to this domain
    const roleRows = await queryCommon(
      `SELECT * FROM career_roles WHERE category = ? ORDER BY title ASC`,
      [domainName]
    );

    const roles = roleRows.map((r) => formatRoleRow(r));

    // Calculate domain-specific statistics from actual database records
    let withSalary = 0;
    let withSkills = 0;
    let minSalary = Infinity;
    let maxSalary = 0;
    const skillCounts = {};
    const toolsSet = new Set();

    roles.forEach((r) => {
      if (r.stats && r.stats.averageSalary) {
        withSalary++;
        if (typeof r.stats.minLpa === 'number' && r.stats.minLpa < minSalary) {
          minSalary = r.stats.minLpa;
        }
        if (typeof r.stats.maxLpa === 'number' && r.stats.maxLpa > maxSalary) {
          maxSalary = r.stats.maxLpa;
        }
      }

      const skills = r.technicalSkills || [];
      if (skills.length > 0) {
        withSkills++;
        skills.forEach((s) => {
          const clean = s.split('/')[0].split('(')[0].trim();
          skillCounts[clean] = (skillCounts[clean] || 0) + 1;
        });
      }

      (r.tools || []).forEach((t) => toolsSet.add(t));
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, count }));

    return res.json({
      success: true,
      data: {
        domain: {
          id: domainRow.id,
          name: domainRow.name,
          description: domainRow.description,
          icon: domainRow.icon,
          roleCount: roles.length,
        },
        roles,
        stats: {
          totalRoles: roles.length,
          rolesWithSalary: withSalary,
          rolesWithSkills: withSkills,
          minLpa: minSalary === Infinity ? null : minSalary,
          maxLpa: maxSalary === 0 ? null : maxSalary,
          topSkills,
          totalTools: toolsSet.size,
        },
      },
    });
  } catch (error) {
    console.error('Error in getDomainBySlug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve domain details.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/roles
 * Fetch all IT career roles from SQL with optional category, search, and tags filters
 */
async function getRoles(req, res) {
  try {
    const { category, q, tags } = req.query;

    let sql = 'SELECT * FROM career_roles WHERE 1=1';
    const params = [];

    if (category && category !== 'All Domains') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      sql += ` AND (
        title LIKE ? OR 
        short_description LIKE ? OR 
        scope LIKE ? OR 
        category LIKE ? OR
        JSON_SEARCH(technical_skills, 'one', ?) IS NOT NULL OR
        JSON_SEARCH(tools, 'one', ?) IS NOT NULL
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, `%${q.trim()}%`, `%${q.trim()}%`);
    }

    sql += ' ORDER BY sort_order ASC, title ASC';

    const rows = await queryCommon(sql, params);
    let roles = rows.map(formatRoleRow);

    // Filter by tags in memory if requested
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      if (tagList.length > 0) {
        roles = roles.filter((role) =>
          tagList.some((t) => role.tags.map((x) => x.toLowerCase()).includes(t))
        );
      }
    }

    return res.json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    console.error('Error in getRoles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career roles from SQL database.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/roles/:id
 * Fetch detailed role information by ID from SQL
 */
async function getRoleById(req, res) {
  try {
    const { id } = req.params;
    const rows = await queryCommon('SELECT * FROM career_roles WHERE id = ? LIMIT 1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Career role '${id}' not found in database.`,
      });
    }

    const role = formatRoleRow(rows[0]);
    return res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error('Error in getRoleById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve role details from SQL database.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/domains/:domainSlug/roles/:roleSlug
 * Fetch specific role under a domain by domain slug and role slug/ID
 */
async function getRoleByDomainAndRole(req, res) {
  try {
    const { domainSlug, roleSlug } = req.params;
    if (!domainSlug || !roleSlug) {
      return res.status(400).json({ success: false, message: 'Domain slug and role slug are required.' });
    }

    // 1. Resolve domain
    const domainRows = await queryCommon(
      `SELECT * FROM career_domains WHERE id = ? OR LOWER(REPLACE(REPLACE(name, ' & ', '-'), ' ', '-')) = ? OR LOWER(name) = ? LIMIT 1`,
      [domainSlug, domainSlug.toLowerCase(), domainSlug.toLowerCase()]
    );

    let domainInfo = null;
    let categoryName = null;
    if (domainRows.length > 0) {
      domainInfo = {
        id: domainRows[0].id,
        name: domainRows[0].name,
        description: domainRows[0].description,
        icon: domainRows[0].icon,
      };
      categoryName = domainRows[0].name;
    }

    // 2. Query role by id or slugified title
    let roleRows = [];
    if (categoryName) {
      roleRows = await queryCommon(
        `SELECT * FROM career_roles WHERE (id = ? OR LOWER(REPLACE(REPLACE(title, ' / ', '-'), ' ', '-')) = ?) AND category = ? LIMIT 1`,
        [roleSlug, roleSlug.toLowerCase(), categoryName]
      );
    }

    // Fallback query without strict category
    if (roleRows.length === 0) {
      roleRows = await queryCommon(
        `SELECT * FROM career_roles WHERE id = ? OR LOWER(REPLACE(REPLACE(title, ' / ', '-'), ' ', '-')) = ? LIMIT 1`,
        [roleSlug, roleSlug.toLowerCase()]
      );
    }

    if (roleRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Career role '${roleSlug}' not found in domain '${domainSlug}'.`,
      });
    }

    const role = formatRoleRow(roleRows[0]);

    if (!domainInfo && role.category) {
      domainInfo = {
        id: role.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: role.category,
      };
    }

    return res.json({
      success: true,
      data: {
        ...role,
        domain: domainInfo,
      },
    });
  } catch (error) {
    console.error('Error in getRoleByDomainAndRole:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career role details.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/compare
 * Compare 2 to 4 roles simultaneously by IDs from SQL
 */
async function compareRoles(req, res) {
  try {
    const { roles } = req.query;
    if (!roles) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const roleIds = roles
      .split(',')
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 4);

    if (roleIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const placeholders = roleIds.map(() => '?').join(',');
    const rows = await queryCommon(
      `SELECT * FROM career_roles WHERE id IN (${placeholders})`,
      roleIds
    );

    const rolesMap = new Map();
    rows.forEach((r) => {
      rolesMap.set(r.id, formatRoleRow(r));
    });

    // Preserve exact order from query param
    const orderedRoles = roleIds.map((id) => rolesMap.get(id)).filter(Boolean);

    return res.json({
      success: true,
      data: orderedRoles,
    });
  } catch (error) {
    console.error('Error in compareRoles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve comparison roles from SQL database.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/stats
 * Aggregates live database statistics for the Career Explorer Overview
 */
async function getCareerStats(req, res) {
  try {
    const rolesCountRow = await queryCommon('SELECT COUNT(*) as c FROM career_roles');
    const domainsCountRow = await queryCommon('SELECT COUNT(*) as c FROM career_domains');
    const roles = await queryCommon('SELECT id, title, category, stats, technical_skills FROM career_roles');

    let withSalary = 0;
    let withSkills = 0;
    let minSalaryAcrossAll = Infinity;
    let maxSalaryAcrossAll = 0;
    const skillCounts = {};
    const domainCounts = {};

    roles.forEach((r) => {
      // Domain counts
      if (r.category) {
        domainCounts[r.category] = (domainCounts[r.category] || 0) + 1;
      }

      // Stats
      let stats = {};
      try {
        stats = typeof r.stats === 'string' ? JSON.parse(r.stats) : r.stats;
      } catch (e) {}

      if (stats && stats.averageSalary) {
        withSalary++;
        const m = String(stats.averageSalary).match(/([\d.]+)\s*-\s*[^\d]*([\d.]+)/);
        if (m) {
          const min = parseFloat(m[1]);
          const max = parseFloat(m[2]);
          if (!isNaN(min) && min < minSalaryAcrossAll) minSalaryAcrossAll = min;
          if (!isNaN(max) && max > maxSalaryAcrossAll) maxSalaryAcrossAll = max;
        }
      }

      // Skills
      let skills = [];
      try {
        skills = typeof r.technical_skills === 'string' ? JSON.parse(r.technical_skills) : r.technical_skills;
      } catch (e) {}

      if (Array.isArray(skills) && skills.length > 0) {
        withSkills++;
        skills.forEach((s) => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    return res.json({
      success: true,
      data: {
        totalRoles: rolesCountRow && rolesCountRow.length > 0 ? rolesCountRow[0].c : roles.length,
        totalDomains: domainsCountRow && domainsCountRow.length > 0 ? domainsCountRow[0].c : Object.keys(domainCounts).length,
        rolesWithSalary: withSalary,
        rolesWithSkills: withSkills,
        minLpa: minSalaryAcrossAll === Infinity ? 4.5 : minSalaryAcrossAll,
        maxLpa: maxSalaryAcrossAll === 0 ? 30.0 : maxSalaryAcrossAll,
        topSkills,
        domainDistribution: Object.entries(domainCounts).map(([name, count]) => ({ name, count })),
      },
    });
  } catch (error) {
    console.error('Error in getCareerStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career statistics from SQL database.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/roles/:id/fit
 * Calculates personalized career fit for authenticated student
 */
async function getRoleFit(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const studentId = req.user?.student_id || 1;

    // 1. Fetch role
    const roleRows = await queryCommon('SELECT * FROM career_roles WHERE id = ? LIMIT 1', [id]);
    if (roleRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    const role = formatRoleRow(roleRows[0]);
    const roleSkills = role.technicalSkills || [];

    // 2. Fetch latest Resume Analysis for this role if any
    let resumeAnalysis = null;
    try {
      const resumeRows = await queryCommon(
        `SELECT id, uuid, overall_score, job_match_score, analysis_json, created_at
         FROM resume_analyses
         WHERE user_id = ? AND role_id = ?
         ORDER BY created_at DESC LIMIT 1`,
        [userId, id]
      );
      if (resumeRows.length > 0) {
        let parsed = {};
        try {
          parsed = typeof resumeRows[0].analysis_json === 'string'
            ? JSON.parse(resumeRows[0].analysis_json)
            : resumeRows[0].analysis_json;
        } catch (e) {}
        resumeAnalysis = {
          id: resumeRows[0].id,
          uuid: resumeRows[0].uuid,
          overallScore: resumeRows[0].overall_score,
          jobMatchScore: resumeRows[0].job_match_score,
          summary: parsed.summary || '',
          strengths: parsed.strengths || [],
          matchedSkills: parsed.matchedSkills || [],
          missingOrWeakSkills: parsed.missingOrWeakSkills || [],
          createdAt: resumeRows[0].created_at,
        };
      }
    } catch (e) {}

    // 3. Fetch Student's active skills
    let studentSkills = [];
    try {
      const skillRows = await queryCommon(
        `SELECT ss.skill_id, ss.proficiency_level, ss.is_verified, ss.evidence_type, sc.name, sc.category
         FROM student_skills ss
         JOIN skills_catalogue sc ON sc.id = ss.skill_id
         WHERE ss.student_id = ?`,
        [studentId]
      );
      studentSkills = skillRows.map((r) => ({
        skillId: r.skill_id,
        name: r.name,
        category: r.category,
        proficiencyLevel: r.proficiency_level,
        isVerified: Boolean(r.is_verified),
        evidenceType: r.evidence_type,
      }));
    } catch (e) {}

    // 4. Calculate skill overlap
    const matchedSkills = [];
    const missingSkills = [];

    roleSkills.forEach((reqSkill) => {
      const cleanReq = reqSkill.toLowerCase();
      const matched = studentSkills.find(
        (s) =>
          cleanReq.includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(cleanReq) ||
          cleanReq.includes(s.skillId.toLowerCase())
      );

      if (matched) {
        matchedSkills.push({
          name: reqSkill,
          skillId: matched.skillId,
          proficiencyLevel: matched.proficiencyLevel,
          isVerified: matched.isVerified,
          evidenceType: matched.evidenceType,
        });
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const skillFitPercentage =
      roleSkills.length > 0
        ? Math.round((matchedSkills.length / roleSkills.length) * 100)
        : 50;

    let overallFitScore = skillFitPercentage;
    if (resumeAnalysis && resumeAnalysis.jobMatchScore) {
      overallFitScore = Math.round(
        resumeAnalysis.jobMatchScore * 0.6 + skillFitPercentage * 0.4
      );
    }

    return res.json({
      success: true,
      data: {
        roleId: role.id,
        roleTitle: role.title,
        category: role.category,
        overallFitScore,
        skillFitPercentage,
        hasResumeAnalysis: Boolean(resumeAnalysis),
        resumeAnalysis,
        hasStudentSkills: studentSkills.length > 0,
        totalStudentSkills: studentSkills.length,
        totalRequiredSkills: roleSkills.length,
        matchedSkills,
        missingSkills,
        verifiedSkillsCount: matchedSkills.filter((s) => s.isVerified).length,
      },
    });
  } catch (error) {
    console.error('Error in getRoleFit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate role fit.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/tags
 */
async function getRoleTags(req, res) {
  try {
    return res.json({
      success: true,
      data: ['Coding', 'Non-Coding', 'Creative', 'Emerging', 'Management', 'Hybrid'],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getDomains,
  getDomainBySlug,
  getCareerStats,
  getRoles,
  getRoleById,
  getRoleByDomainAndRole,
  getRoleFit,
  compareRoles,
  getRoleTags,
  formatRoleRow,
};
