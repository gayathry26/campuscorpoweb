const { queryCommon } = require('../config/db');
const { MASTER_CAREER_DOMAINS, CAREER_DOMAINS } = require('../data/masterCareerDomains');
const { MASTER_CAREER_ROLES } = require('../data/masterCareerRoles');

const masterDomains = (Array.isArray(MASTER_CAREER_DOMAINS) && MASTER_CAREER_DOMAINS.length > 0)
  ? MASTER_CAREER_DOMAINS
  : (Array.isArray(CAREER_DOMAINS) ? CAREER_DOMAINS : []);
const masterRoles = Array.isArray(MASTER_CAREER_ROLES) ? MASTER_CAREER_ROLES : [];

/**
 * Format a raw SQL career_roles row into the frontend role object structure
 */
function formatRoleRow(row, roleDomains = []) {
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
    averageSalary: '₹7.0 - ₹18.0 LPA',
    jobOpenings: '30,000+ Active Roles',
    growthRate: '+20% YoY Growth',
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

  // Combine domainIds
  const domainIds = Array.isArray(roleDomains) && roleDomains.length > 0
    ? roleDomains
    : [row.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')];

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    domainIds: domainIds,
    tags: parseJsonSafe(row.tags, []),
    level: row.level || 'Entry-Level / Graduate',
    isBeginnerFriendly: Boolean(row.is_beginner_friendly !== 0 && row.is_beginner_friendly !== false),
    shortDescription: row.short_description || '',
    scope: row.scope || '',
    responsibilities: parseJsonSafe(row.responsibilities, []),
    deliverables: parseJsonSafe(row.deliverables, []),
    technicalSkills: parseJsonSafe(row.technical_skills, []),
    softSkills: parseJsonSafe(row.soft_skills, []),
    tools: (() => {
      const parsed = parseJsonSafe(row.tools, []);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.values(parsed).flat().filter((t) => typeof t === 'string');
      }
      return [];
    })(),
    stats: {
      ...stats,
      minLpa,
      maxLpa,
      averageSalary: stats.averageSalary || 'Competitive Market Rate',
    },
    careerReadiness: parseJsonSafe(row.career_readiness, {
      prerequisites: [],
      entryLevelExpected: [],
      midSeniorExpected: [],
      gaps: [],
    }),
    roadmap: parseJsonSafe(row.roadmap, []),
    projects: parseJsonSafe(row.projects, {
      beginner: null,
      intermediate: null,
      advanced: null,
    }),
    interviewQuestions: parseJsonSafe(row.interview_questions, []),
    topHiringCompanies: parseJsonSafe(row.top_hiring_companies, []),
    relatedRoles: parseJsonSafe(row.related_roles, []),
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/v1/career/domains
 * Fetch all 38 career domains with comprehensive role counts from SQL
 */
async function getDomains(req, res) {
  try {
    const sql = `
      SELECT cd.*, 
        COUNT(DISTINCT cr.id) AS role_count,
        GROUP_CONCAT(DISTINCT cr.title ORDER BY cr.sort_order ASC SEPARATOR '||') AS sample_roles
      FROM career_domains cd
      LEFT JOIN career_role_domains crd ON crd.domain_id = cd.id
      LEFT JOIN career_roles cr ON cr.id = crd.role_id OR cr.category = cd.name
      GROUP BY cd.id, cd.name, cd.family, cd.icon, cd.short_description, cd.overview,
               cd.what_professionals_do, cd.core_technologies, cd.prerequisites,
               cd.related_domains, cd.career_progression, cd.sort_order, cd.created_at, cd.updated_at
      ORDER BY cd.sort_order ASC, cd.name ASC
    `;
    const rows = await queryCommon(sql);

    const parseJson = (val, fb = []) => {
      if (!val) return fb;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch (e) { return fb; }
    };

    const domains = (rows && rows.length > 0)
      ? rows.map((r) => ({
          id: r.id,
          name: r.name,
          family: r.family || 'Software & Web Engineering',
          icon: r.icon || 'Compass',
          shortDescription: r.short_description || r.description || '',
          overview: r.overview || '',
          whatProfessionalsDo: parseJson(r.what_professionals_do, []),
          coreTechnologies: parseJson(r.core_technologies, []),
          prerequisites: parseJson(r.prerequisites, []),
          relatedDomains: parseJson(r.related_domains, []),
          careerProgression: r.career_progression || '',
          roleCount: Number(r.role_count || 0),
          sampleRoles: r.sample_roles ? r.sample_roles.split('||').slice(0, 3) : [],
          sortOrder: r.sort_order || 0,
        }))
      : masterDomains.map((d) => ({
          id: d.id,
          name: d.name,
          family: d.family,
          icon: d.icon,
          shortDescription: d.shortDescription || '',
          overview: d.overview || '',
          whatProfessionalsDo: d.whatProfessionalsDo || [],
          coreTechnologies: d.coreTechnologies || [],
          prerequisites: d.prerequisites || [],
          relatedDomains: d.relatedDomains || [],
          careerProgression: d.careerProgression || '',
          roleCount: masterRoles.filter((r) => (r.domainIds && r.domainIds.includes(d.id)) || r.category === d.name).length,
          sampleRoles: masterRoles.filter((r) => (r.domainIds && r.domainIds.includes(d.id)) || r.category === d.name).slice(0, 3).map((r) => r.title),
          sortOrder: d.sortOrder || 0,
        }));

    // Calculate total distinct roles in system
    let totalRoles = 0;
    try {
      const totalRolesRow = await queryCommon('SELECT COUNT(*) as c FROM career_roles');
      totalRoles = totalRolesRow && totalRolesRow.length > 0 ? totalRolesRow[0].c : MASTER_CAREER_ROLES.length;
    } catch (e) {
      totalRoles = MASTER_CAREER_ROLES.length;
    }

    return res.json({
      success: true,
      domains,
      data: {
        categories: ['All Domains', ...domains.map((d) => d.name)],
        domains,
        totalRoles: totalRoles || MASTER_CAREER_ROLES.length,
        totalDomains: domains.length,
      },
    });
  } catch (error) {
    console.error('Error in getDomains (falling back to master dataset):', error.message);
    const fallbackDomains = masterDomains.map((d) => ({
      id: d.id,
      name: d.name,
      family: d.family,
      icon: d.icon,
      shortDescription: d.shortDescription || '',
      overview: d.overview || '',
      whatProfessionalsDo: d.whatProfessionalsDo || [],
      coreTechnologies: d.coreTechnologies || [],
      prerequisites: d.prerequisites || [],
      relatedDomains: d.relatedDomains || [],
      careerProgression: d.careerProgression || '',
      roleCount: masterRoles.filter((r) => (r.domainIds && r.domainIds.includes(d.id)) || r.category === d.name).length,
      sampleRoles: masterRoles.filter((r) => (r.domainIds && r.domainIds.includes(d.id)) || r.category === d.name).slice(0, 3).map((r) => r.title),
      sortOrder: d.sortOrder || 0,
    }));
    return res.json({
      success: true,
      domains: fallbackDomains,
      data: {
        categories: ['All Domains', ...fallbackDomains.map((d) => d.name)],
        domains: fallbackDomains,
        totalRoles: MASTER_CAREER_ROLES.length,
        totalDomains: fallbackDomains.length,
      },
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
      `SELECT * FROM career_domains 
       WHERE id = ? 
          OR LOWER(REPLACE(REPLACE(REPLACE(name, ' & ', '-'), ' ', '-'), '/', '-')) = ? 
          OR LOWER(name) = ? 
       LIMIT 1`,
      [slug, slug.toLowerCase(), slug.toLowerCase()]
    );

    if (domainRows.length === 0) {
      const cleanSlug = slug.toLowerCase();
      const matchedMaster = masterDomains.find(
        (d) =>
          d.id.toLowerCase() === cleanSlug ||
          d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug ||
          d.name.toLowerCase() === cleanSlug
      );
      if (!matchedMaster) {
        return res.status(404).json({
          success: false,
          message: `Career domain '${slug}' not found.`,
        });
      }

      const domainRoles = masterRoles.filter(
        (r) =>
          (r.domainIds && r.domainIds.some((d) => d.toLowerCase() === matchedMaster.id.toLowerCase())) ||
          r.category.toLowerCase() === matchedMaster.name.toLowerCase()
      );

      let withSalary = 0;
      let withSkills = 0;
      let minSalary = Infinity;
      let maxSalary = 0;
      const skillCounts = {};
      const toolsSet = new Set();

      domainRoles.forEach((r) => {
        if (r.stats && r.stats.averageSalary) {
          withSalary++;
          if (typeof r.stats.minLpa === 'number' && r.stats.minLpa < minSalary) minSalary = r.stats.minLpa;
          if (typeof r.stats.maxLpa === 'number' && r.stats.maxLpa > maxSalary) maxSalary = r.stats.maxLpa;
        }
        const skills = Array.isArray(r.technicalSkills) ? r.technicalSkills : [];
        if (skills.length > 0) {
          withSkills++;
          skills.forEach((s) => {
            if (typeof s === 'string') {
              const clean = s.split('/')[0].split('(')[0].trim();
              skillCounts[clean] = (skillCounts[clean] || 0) + 1;
            }
          });
        }
        const roleToolsList = Array.isArray(r.tools) ? r.tools : [];
        roleToolsList.forEach((t) => toolsSet.add(t));
      });

      const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([skill, count]) => ({ skill, count }));

      const domainData = {
        id: matchedMaster.id,
        name: matchedMaster.name,
        family: matchedMaster.family,
        icon: matchedMaster.icon,
        shortDescription: matchedMaster.shortDescription || '',
        overview: matchedMaster.overview || '',
        whatProfessionalsDo: matchedMaster.whatProfessionalsDo || [],
        coreTechnologies: matchedMaster.coreTechnologies || [],
        prerequisites: matchedMaster.prerequisites || [],
        relatedDomains: matchedMaster.relatedDomains || [],
        careerProgression: matchedMaster.careerProgression || '',
        roleCount: domainRoles.length,
      };

      const statsData = {
        totalRoles: domainRoles.length,
        rolesWithSalary: withSalary,
        rolesWithSkills: withSkills,
        minLpa: minSalary === Infinity ? null : minSalary,
        maxLpa: maxSalary === 0 ? null : maxSalary,
        topSkills,
        totalTools: toolsSet.size,
      };

      return res.json({
        success: true,
        domain: domainData,
        roles: domainRoles,
        stats: statsData,
        data: {
          domain: domainData,
          roles: domainRoles,
          stats: statsData,
        },
      });
    }

    const domainRow = domainRows[0];
    const domainId = domainRow.id;
    const domainName = domainRow.name;

    const parseJson = (val, fb = []) => {
      if (!val) return fb;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch (e) { return fb; }
    };

    // Fetch roles mapped to this domain (either primary category or via career_role_domains)
    const roleRows = await queryCommon(
      `SELECT DISTINCT cr.* 
       FROM career_roles cr
       LEFT JOIN career_role_domains crd ON crd.role_id = cr.id
       WHERE cr.category = ? OR crd.domain_id = ?
       ORDER BY cr.sort_order ASC, cr.title ASC`,
      [domainName, domainId]
    );

    // Fetch domainIds for each role
    const roles = [];
    for (const r of roleRows) {
      const crdRows = await queryCommon(
        'SELECT domain_id FROM career_role_domains WHERE role_id = ?',
        [r.id]
      );
      const roleDomains = crdRows.map((x) => x.domain_id);
      roles.push(formatRoleRow(r, roleDomains));
    }

    // Calculate domain-specific statistics
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

      const roleToolsList = Array.isArray(r.tools)
        ? r.tools
        : typeof r.tools === 'object' && r.tools !== null
        ? Object.values(r.tools).flat().filter((t) => typeof t === 'string')
        : [];
      roleToolsList.forEach((t) => toolsSet.add(t));
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, count }));

    const domainData = {
      id: domainRow.id,
      name: domainRow.name,
      family: domainRow.family,
      icon: domainRow.icon,
      shortDescription: domainRow.short_description || domainRow.description || '',
      overview: domainRow.overview || '',
      whatProfessionalsDo: parseJson(domainRow.what_professionals_do, []),
      coreTechnologies: parseJson(domainRow.core_technologies, []),
      prerequisites: parseJson(domainRow.prerequisites, []),
      relatedDomains: parseJson(domainRow.related_domains, []),
      careerProgression: domainRow.career_progression || '',
      roleCount: roles.length,
    };

    const statsData = {
      totalRoles: roles.length,
      rolesWithSalary: withSalary,
      rolesWithSkills: withSkills,
      minLpa: minSalary === Infinity ? null : minSalary,
      maxLpa: maxSalary === 0 ? null : maxSalary,
      topSkills,
      totalTools: toolsSet.size,
    };

    return res.json({
      success: true,
      domain: domainData,
      roles,
      stats: statsData,
      data: {
        domain: domainData,
        roles,
        stats: statsData,
      },
    });
  } catch (error) {
    console.error('Error in getDomainBySlug (falling back to master in-memory dataset):', error.message);
    try {
      const { slug } = req.params;
      const cleanSlug = (slug || '').toLowerCase();
      const matchedMaster = masterDomains.find(
        (d) =>
          d.id.toLowerCase() === cleanSlug ||
          d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug ||
          d.name.toLowerCase() === cleanSlug
      );
      if (matchedMaster) {
        const domainRoles = masterRoles.filter(
          (r) =>
            (r.domainIds && r.domainIds.some((d) => d.toLowerCase() === matchedMaster.id.toLowerCase())) ||
            r.category.toLowerCase() === matchedMaster.name.toLowerCase()
        );
        let withSalary = 0;
        let withSkills = 0;
        let minSalary = Infinity;
        let maxSalary = 0;
        const skillCounts = {};
        const toolsSet = new Set();
        domainRoles.forEach((r) => {
          if (r.stats && r.stats.averageSalary) {
            withSalary++;
            if (typeof r.stats.minLpa === 'number' && r.stats.minLpa < minSalary) minSalary = r.stats.minLpa;
            if (typeof r.stats.maxLpa === 'number' && r.stats.maxLpa > maxSalary) maxSalary = r.stats.maxLpa;
          }
          const skills = Array.isArray(r.technicalSkills) ? r.technicalSkills : [];
          if (skills.length > 0) {
            withSkills++;
            skills.forEach((s) => {
              if (typeof s === 'string') {
                const clean = s.split('/')[0].split('(')[0].trim();
                skillCounts[clean] = (skillCounts[clean] || 0) + 1;
              }
            });
          }
          const roleToolsList = Array.isArray(r.tools) ? r.tools : [];
          roleToolsList.forEach((t) => toolsSet.add(t));
        });
        const topSkills = Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([skill, count]) => ({ skill, count }));
        const domainData = {
          id: matchedMaster.id,
          name: matchedMaster.name,
          family: matchedMaster.family,
          icon: matchedMaster.icon,
          shortDescription: matchedMaster.shortDescription || '',
          overview: matchedMaster.overview || '',
          whatProfessionalsDo: matchedMaster.whatProfessionalsDo || [],
          coreTechnologies: matchedMaster.coreTechnologies || [],
          prerequisites: matchedMaster.prerequisites || [],
          relatedDomains: matchedMaster.relatedDomains || [],
          careerProgression: matchedMaster.careerProgression || '',
          roleCount: domainRoles.length,
        };
        const statsData = {
          totalRoles: domainRoles.length,
          rolesWithSalary: withSalary,
          rolesWithSkills: withSkills,
          minLpa: minSalary === Infinity ? 4.5 : minSalary,
          maxLpa: maxSalary === 0 ? 25.0 : maxSalary,
          topSkills,
          totalTools: toolsSet.size,
        };
        return res.json({
          success: true,
          domain: domainData,
          roles: domainRoles,
          stats: statsData,
          data: {
            domain: domainData,
            roles: domainRoles,
            stats: statsData,
          },
        });
      }
    } catch (fallbackErr) {
      console.error('Fallback error in getDomainBySlug:', fallbackErr);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve domain details.',
      error: error.message,
    });
  }
}

/**
 * GET /api/v1/career/roles
 * Fetch all IT career roles from SQL with filters
 */
async function getRoles(req, res) {
  try {
    const { category, domain, q, tags, level, beginnerOnly, skill } = req.query;

    let sql = `
      SELECT DISTINCT cr.* 
      FROM career_roles cr
      LEFT JOIN career_role_domains crd ON crd.role_id = cr.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'All Domains') {
      sql += ' AND cr.category = ?';
      params.push(category);
    }

    if (domain) {
      sql += ' AND (crd.domain_id = ? OR cr.category = ?)';
      params.push(domain, domain);
    }

    if (level && level !== 'All Levels') {
      sql += ' AND cr.level = ?';
      params.push(level);
    }

    if (beginnerOnly === 'true' || beginnerOnly === true) {
      sql += ' AND cr.is_beginner_friendly = 1';
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      sql += ` AND (
        cr.title LIKE ? OR 
        cr.short_description LIKE ? OR 
        cr.scope LIKE ? OR 
        cr.category LIKE ? OR
        JSON_SEARCH(cr.technical_skills, 'one', ?) IS NOT NULL OR
        JSON_SEARCH(cr.tools, 'one', ?) IS NOT NULL
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, `%${q.trim()}%`, `%${q.trim()}%`);
    }

    sql += ' ORDER BY cr.sort_order ASC, cr.title ASC';

    const rows = await queryCommon(sql, params);

    // Fetch domain IDs for all returned roles
    const roles = [];
    for (const r of rows) {
      const crdRows = await queryCommon(
        'SELECT domain_id FROM career_role_domains WHERE role_id = ?',
        [r.id]
      );
      const roleDomains = crdRows.map((x) => x.domain_id);
      roles.push(formatRoleRow(r, roleDomains));
    }

    // Filter by tags or skill in memory if specified
    let filteredRoles = roles;
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      if (tagList.length > 0) {
        filteredRoles = filteredRoles.filter((role) =>
          tagList.some((t) => role.tags.map((x) => x.toLowerCase()).includes(t))
        );
      }
    }

    if (skill && skill.trim()) {
      const s = skill.toLowerCase().trim();
      filteredRoles = filteredRoles.filter((role) =>
        (role.technicalSkills || []).some((ts) => ts.toLowerCase().includes(s)) ||
        (role.tools || []).some((tl) => tl.toLowerCase().includes(s))
      );
    }

    return res.json({
      success: true,
      count: filteredRoles.length,
      data: filteredRoles,
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
 * Fetch detailed role information by ID or slug from SQL
 */
async function getRoleById(req, res) {
  try {
    const { id } = req.params;
    const cleanId = id.toLowerCase().trim();

    const rows = await queryCommon(
      `SELECT * FROM career_roles 
       WHERE id = ? 
          OR LOWER(REPLACE(REPLACE(title, ' / ', '-'), ' ', '-')) = ? 
          OR LOWER(title) = ?
       LIMIT 1`,
      [cleanId, cleanId, cleanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Career role '${id}' not found in database.`,
      });
    }

    const r = rows[0];
    const crdRows = await queryCommon(
      'SELECT domain_id FROM career_role_domains WHERE role_id = ?',
      [r.id]
    );
    const roleDomains = crdRows.map((x) => x.domain_id);
    const role = formatRoleRow(r, roleDomains);

    // Resolve primary domain object
    let domainInfo = null;
    if (roleDomains.length > 0) {
      const dRows = await queryCommon('SELECT id, name, family, icon FROM career_domains WHERE id = ? LIMIT 1', [roleDomains[0]]);
      if (dRows.length > 0) domainInfo = dRows[0];
    }
    if (!domainInfo && role.category) {
      const dRows = await queryCommon('SELECT id, name, family, icon FROM career_domains WHERE name = ? LIMIT 1', [role.category]);
      if (dRows.length > 0) {
        domainInfo = dRows[0];
      } else {
        domainInfo = {
          id: role.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: role.category,
        };
      }
    }

    return res.json({
      success: true,
      data: {
        ...role,
        domain: domainInfo,
      },
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
      `SELECT * FROM career_domains 
       WHERE id = ? 
          OR LOWER(REPLACE(REPLACE(REPLACE(name, ' & ', '-'), ' ', '-'), '/', '-')) = ? 
          OR LOWER(name) = ? 
       LIMIT 1`,
      [domainSlug, domainSlug.toLowerCase(), domainSlug.toLowerCase()]
    );

    let domainInfo = null;
    let domainId = null;
    let categoryName = null;
    if (domainRows.length > 0) {
      domainInfo = {
        id: domainRows[0].id,
        name: domainRows[0].name,
        family: domainRows[0].family,
        description: domainRows[0].short_description || domainRows[0].description,
        icon: domainRows[0].icon,
      };
      domainId = domainRows[0].id;
      categoryName = domainRows[0].name;
    }

    // 2. Query role by id or slugified title
    let roleRows = [];
    if (domainId) {
      roleRows = await queryCommon(
        `SELECT DISTINCT cr.* FROM career_roles cr
         LEFT JOIN career_role_domains crd ON crd.role_id = cr.id
         WHERE (cr.id = ? OR LOWER(REPLACE(REPLACE(cr.title, ' / ', '-'), ' ', '-')) = ?)
           AND (cr.category = ? OR crd.domain_id = ?)
         LIMIT 1`,
        [roleSlug, roleSlug.toLowerCase(), categoryName, domainId]
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

    const r = roleRows[0];
    const crdRows = await queryCommon(
      'SELECT domain_id FROM career_role_domains WHERE role_id = ?',
      [r.id]
    );
    const roleDomains = crdRows.map((x) => x.domain_id);
    const role = formatRoleRow(r, roleDomains);

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
    for (const r of rows) {
      const crdRows = await queryCommon(
        'SELECT domain_id FROM career_role_domains WHERE role_id = ?',
        [r.id]
      );
      const roleDomains = crdRows.map((x) => x.domain_id);
      rolesMap.set(r.id, formatRoleRow(r, roleDomains));
    }

    // Preserve exact order from query param
    const orderedRoles = roleIds.map((id) => rolesMap.get(id)).filter(Boolean);

    return res.json({
      success: true,
      roles: orderedRoles,
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
          skill: reqSkill,
          verified: matched.isVerified,
          level: matched.proficiencyLevel,
        });
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const matchScore = roleSkills.length > 0
      ? Math.round((matchedSkills.length / roleSkills.length) * 100)
      : 0;

    return res.json({
      success: true,
      data: {
        roleId: role.id,
        roleTitle: role.title,
        matchScore,
        matchedSkills,
        missingSkills,
        resumeAnalysis,
      },
    });
  } catch (error) {
    console.error('Error in getRoleFit:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate role fitment.',
      error: error.message,
    });
  }
}

/**
 * POST /api/v1/career/roles/:id/favorite
 * Toggle saving a role to student's favorites in SQL
 */
async function toggleFavoriteRole(req, res) {
  try {
    const { id } = req.params;
    const studentId = req.user?.student_id || req.user?.id || 'demo-student';

    // Check if exists
    const existing = await queryCommon(
      'SELECT id FROM student_saved_roles WHERE student_id = ? AND role_id = ?',
      [studentId, id]
    );

    if (existing.length > 0) {
      await queryCommon(
        'DELETE FROM student_saved_roles WHERE student_id = ? AND role_id = ?',
        [studentId, id]
      );
      return res.json({ success: true, saved: false, message: 'Role removed from favourites.' });
    } else {
      await queryCommon(
        'INSERT INTO student_saved_roles (student_id, role_id) VALUES (?, ?)',
        [studentId, id]
      );
      return res.json({ success: true, saved: true, message: 'Role saved to favourites.' });
    }
  } catch (error) {
    console.error('Error in toggleFavoriteRole:', error);
    return res.status(500).json({ success: false, message: 'Failed to update favourite status.' });
  }
}

/**
 * GET /api/v1/career/favorites
 * Fetch list of favourite roles for the authenticated student
 */
async function getFavoriteRoles(req, res) {
  try {
    const studentId = req.user?.student_id || req.user?.id || 'demo-student';
    const rows = await queryCommon(
      `SELECT cr.* 
       FROM student_saved_roles ssr
       JOIN career_roles cr ON cr.id = ssr.role_id
       WHERE ssr.student_id = ?
       ORDER BY ssr.created_at DESC`,
      [studentId]
    );

    const roles = rows.map((r) => formatRoleRow(r));
    return res.json({ success: true, data: roles });
  } catch (error) {
    console.error('Error in getFavoriteRoles:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch favourite roles.' });
  }
}

/**
 * GET /api/v1/career/roles/:id/skills
 * Get skills and technologies for a role
 */
async function getRoleSkills(req, res) {
  try {
    const { id } = req.params;
    const cleanId = id.toLowerCase().trim();
    const rows = await queryCommon(
      'SELECT id, title, category, technical_skills, soft_skills, tools FROM career_roles WHERE id = ? LIMIT 1',
      [cleanId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Role '${id}' not found.` });
    }
    const r = rows[0];
    const parseJsonSafe = (val, fb = []) => {
      if (!val) return fb;
      if (typeof val === 'object') return val;
      try { return JSON.parse(val); } catch (e) { return fb; }
    };
    return res.json({
      success: true,
      data: {
        roleId: r.id,
        roleTitle: r.title,
        category: r.category,
        technicalSkills: parseJsonSafe(r.technical_skills, []),
        softSkills: parseJsonSafe(r.soft_skills, []),
        tools: parseJsonSafe(r.tools, []),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve skills.', error: error.message });
  }
}

/**
 * GET /api/v1/career/roles/:id/roadmap
 * Retrieve learning roadmap for a role
 */
async function getRoleRoadmap(req, res) {
  try {
    const { id } = req.params;
    const rows = await queryCommon(
      'SELECT id, title, roadmap FROM career_roles WHERE id = ? LIMIT 1',
      [id.toLowerCase().trim()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Role '${id}' not found.` });
    }
    const r = rows[0];
    let roadmap = [];
    try {
      roadmap = typeof r.roadmap === 'string' ? JSON.parse(r.roadmap) : (r.roadmap || []);
    } catch (e) {}
    return res.json({
      success: true,
      roadmap,
      stages: roadmap,
      data: { roleId: r.id, roleTitle: r.title, roadmap, stages: roadmap },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve roadmap.', error: error.message });
  }
}

/**
 * GET /api/v1/career/roles/:id/projects
 * Retrieve recommended projects for a role
 */
async function getRoleProjects(req, res) {
  try {
    const { id } = req.params;
    const rows = await queryCommon(
      'SELECT id, title, projects FROM career_roles WHERE id = ? LIMIT 1',
      [id.toLowerCase().trim()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Role '${id}' not found.` });
    }
    const r = rows[0];
    let projects = {};
    try {
      projects = typeof r.projects === 'string' ? JSON.parse(r.projects) : (r.projects || {});
    } catch (e) {}
    return res.json({
      success: true,
      projects,
      data: { roleId: r.id, roleTitle: r.title, projects },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve projects.', error: error.message });
  }
}

/**
 * POST /api/v1/career/assessments
 * Submit and persist a student's skill assessment for a role
 */
async function submitAssessment(req, res) {
  try {
    const studentId = req.user?.student_id || req.user?.id || 'demo-student';
    const { roleId, matchedSkills = [], missingSkills = [], readinessScore = 0, recommendedRoadmap = [] } = req.body;

    if (!roleId) {
      return res.status(400).json({ success: false, message: 'Role ID is required for skill assessment.' });
    }

    const [result] = await queryCommon(
      `INSERT INTO student_skill_assessments 
       (student_id, role_id, readiness_score, matched_skills, missing_skills, recommended_roadmap)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        roleId,
        readinessScore,
        JSON.stringify(matchedSkills),
        JSON.stringify(missingSkills),
        JSON.stringify(recommendedRoadmap),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Skill assessment saved successfully.',
      data: {
        assessmentId: result.insertId,
        studentId,
        roleId,
        readinessScore,
      },
    });
  } catch (error) {
    console.error('Error in submitAssessment:', error);
    return res.status(500).json({ success: false, message: 'Failed to save skill assessment.', error: error.message });
  }
}

/**
 * GET /api/v1/career/assessments
 * Retrieve past skill assessments for authenticated student
 */
async function getAssessments(req, res) {
  try {
    const studentId = req.user?.student_id || req.user?.id || 'demo-student';
    const rows = await queryCommon(
      `SELECT ssa.*, cr.title as role_title, cr.category
       FROM student_skill_assessments ssa
       LEFT JOIN career_roles cr ON cr.id = ssa.role_id
       WHERE ssa.student_id = ?
       ORDER BY ssa.created_at DESC`,
      [studentId]
    );

    const assessments = rows.map((r) => ({
      id: r.id,
      studentId: r.student_id,
      roleId: r.role_id,
      roleTitle: r.role_title || r.role_id,
      category: r.category,
      readinessScore: r.readiness_score,
      matchedSkills: typeof r.matched_skills === 'string' ? JSON.parse(r.matched_skills) : (r.matched_skills || []),
      missingSkills: typeof r.missing_skills === 'string' ? JSON.parse(r.missing_skills) : (r.missing_skills || []),
      recommendedRoadmap: typeof r.recommended_roadmap === 'string' ? JSON.parse(r.recommended_roadmap) : (r.recommended_roadmap || []),
      createdAt: r.created_at,
    }));

    return res.json({ success: true, data: assessments });
  } catch (error) {
    console.error('Error in getAssessments:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve skill assessments.', error: error.message });
  }
}

/**
 * GET /api/v1/career/tags
 * Returns list of standard role tags
 */
async function getRoleTags(req, res) {
  try {
    const roles = await queryCommon('SELECT tags FROM career_roles');
    const tagSet = new Set(['Coding', 'Non-Coding', 'Creative', 'Emerging', 'Management', 'Hybrid']);
    roles.forEach((r) => {
      let t = [];
      try {
        t = typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []);
      } catch (e) {}
      if (Array.isArray(t)) {
        t.forEach((tag) => tagSet.add(tag));
      }
    });

    return res.json({
      success: true,
      tags: Array.from(tagSet),
    });
  } catch (error) {
    console.error('Error in getRoleTags:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve role tags.',
      error: error.message,
    });
  }
}

/**
 * Admin: Add or update domain entry in catalogue
 */
async function adminSaveDomain(req, res) {
  try {
    const { id, name, family, icon, shortDescription, overview, coreTechnologies, prerequisites, relatedDomains, careerProgression, sortOrder } = req.body;
    if (!id || !name) {
      return res.status(400).json({ success: false, message: 'Domain ID and Name are required.' });
    }

    await queryCommon(
      `INSERT INTO career_domains (
        id, name, family, icon, short_description, overview,
        core_technologies, prerequisites, related_domains, career_progression, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        family = VALUES(family),
        icon = VALUES(icon),
        short_description = VALUES(short_description),
        overview = VALUES(overview),
        core_technologies = VALUES(core_technologies),
        prerequisites = VALUES(prerequisites),
        related_domains = VALUES(related_domains),
        career_progression = VALUES(career_progression),
        sort_order = VALUES(sort_order)`,
      [
        id,
        name,
        family || 'Software & Web Engineering',
        icon || 'Compass',
        shortDescription || '',
        overview || '',
        JSON.stringify(coreTechnologies || []),
        JSON.stringify(prerequisites || []),
        JSON.stringify(relatedDomains || []),
        careerProgression || '',
        sortOrder || 0,
      ]
    );

    return res.json({ success: true, message: `Domain '${name}' saved successfully.` });
  } catch (error) {
    console.error('Error in adminSaveDomain:', error);
    return res.status(500).json({ success: false, message: 'Failed to save domain entry.', error: error.message });
  }
}

/**
 * Admin: Add or update role entry in catalogue
 */
async function adminSaveRole(req, res) {
  try {
    const {
      id, title, category, domainIds, tags, level, isBeginnerFriendly,
      shortDescription, scope, responsibilities, deliverables, technicalSkills,
      softSkills, tools, stats, careerReadiness, roadmap, projects, interviewQuestions,
      topHiringCompanies, relatedRoles, sortOrder
    } = req.body;

    if (!id || !title || !category) {
      return res.status(400).json({ success: false, message: 'Role ID, Title, and Category are required.' });
    }

    await queryCommon(
      `INSERT INTO career_roles (
        id, title, category, tags, level, is_beginner_friendly,
        short_description, scope, responsibilities, deliverables,
        technical_skills, soft_skills, tools, stats,
        career_readiness, roadmap, projects, interview_questions,
        top_hiring_companies, related_roles, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        category = VALUES(category),
        tags = VALUES(tags),
        level = VALUES(level),
        is_beginner_friendly = VALUES(is_beginner_friendly),
        short_description = VALUES(short_description),
        scope = VALUES(scope),
        responsibilities = VALUES(responsibilities),
        deliverables = VALUES(deliverables),
        technical_skills = VALUES(technical_skills),
        soft_skills = VALUES(soft_skills),
        tools = VALUES(tools),
        stats = VALUES(stats),
        career_readiness = VALUES(career_readiness),
        roadmap = VALUES(roadmap),
        projects = VALUES(projects),
        interview_questions = VALUES(interview_questions),
        top_hiring_companies = VALUES(top_hiring_companies),
        related_roles = VALUES(related_roles),
        sort_order = VALUES(sort_order)`,
      [
        id,
        title,
        category,
        JSON.stringify(tags || []),
        level || 'Entry-Level / Graduate',
        isBeginnerFriendly !== false ? 1 : 0,
        shortDescription || '',
        scope || '',
        JSON.stringify(responsibilities || []),
        JSON.stringify(deliverables || []),
        JSON.stringify(technicalSkills || []),
        JSON.stringify(softSkills || []),
        JSON.stringify(tools || []),
        JSON.stringify(stats || {}),
        JSON.stringify(careerReadiness || {}),
        JSON.stringify(roadmap || []),
        JSON.stringify(projects || {}),
        JSON.stringify(interviewQuestions || []),
        JSON.stringify(topHiringCompanies || []),
        JSON.stringify(relatedRoles || []),
        sortOrder || 0,
      ]
    );

    // Sync domain mappings
    if (Array.isArray(domainIds) && domainIds.length > 0) {
      await queryCommon('DELETE FROM career_role_domains WHERE role_id = ?', [id]);
      for (let idx = 0; idx < domainIds.length; idx++) {
        await queryCommon(
          'INSERT INTO career_role_domains (role_id, domain_id, is_primary) VALUES (?, ?, ?)',
          [id, domainIds[idx], idx === 0 ? 1 : 0]
        );
      }
    }

    return res.json({ success: true, message: `Role '${title}' saved successfully.` });
  } catch (error) {
    console.error('Error in adminSaveRole:', error);
    return res.status(500).json({ success: false, message: 'Failed to save role entry.', error: error.message });
  }
}

/**
 * Admin: Delete role from catalogue
 */
async function adminDeleteRole(req, res) {
  try {
    const { id } = req.params;
    await queryCommon('DELETE FROM career_role_domains WHERE role_id = ?', [id]);
    await queryCommon('DELETE FROM career_roles WHERE id = ?', [id]);
    return res.json({ success: true, message: `Role '${id}' removed from catalogue.` });
  } catch (error) {
    console.error('Error in adminDeleteRole:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete role.', error: error.message });
  }
}

module.exports = {
  getDomains,
  getDomainBySlug,
  getRoles,
  getRoleById,
  getRoleByDomainAndRole,
  compareRoles,
  getCareerStats,
  getRoleFit,
  toggleFavoriteRole,
  getFavoriteRoles,
  getRoleTags,
  getRoleSkills,
  getRoleRoadmap,
  getRoleProjects,
  submitAssessment,
  getAssessments,
  adminSaveDomain,
  adminSaveRole,
  adminDeleteRole,
};
