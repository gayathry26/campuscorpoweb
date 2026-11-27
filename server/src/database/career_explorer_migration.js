const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_COMMON_NAME || 'lms',
};

async function runCareerExplorerMigration(targetDb = null) {
  const activeDatabase = targetDb || process.env.DB_COMMON_NAME || 'lms';
  const connectionConfig = {
    ...dbConfig,
    database: activeDatabase,
  };

  console.log('================================================================');
  console.log(`🚀 [MIGRATION] Setting up CampusCorp IT Domains & Roles SQL Tables on ${activeDatabase}...`);
  console.log('================================================================');

  let conn;
  try {
    conn = await mysql.createConnection(connectionConfig);
    console.log(`✓ Connected to MySQL database '${activeDatabase}' on ${connectionConfig.host}:${connectionConfig.port}`);

    // 1. Create career_domains table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS career_domains (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        family VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        short_description TEXT,
        overview TEXT,
        what_professionals_do JSON,
        core_technologies JSON,
        prerequisites JSON,
        related_domains JSON,
        career_progression TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_domain_family (family)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created/verified table: career_domains');

    // 2. Create career_roles table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS career_roles (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(150) NOT NULL,
        tags JSON,
        level VARCHAR(64) DEFAULT 'Entry-Level / Graduate',
        is_beginner_friendly BOOLEAN DEFAULT TRUE,
        short_description TEXT,
        scope TEXT,
        responsibilities JSON,
        deliverables JSON,
        technical_skills JSON,
        soft_skills JSON,
        tools JSON,
        stats JSON,
        career_readiness JSON,
        roadmap JSON,
        projects JSON,
        interview_questions JSON,
        top_hiring_companies JSON,
        related_roles JSON,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role_category (category),
        INDEX idx_role_level (level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created/verified table: career_roles');

    // 3. Create career_role_domains junction table (Many-to-Many mapping)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS career_role_domains (
        role_id VARCHAR(100) NOT NULL,
        domain_id VARCHAR(100) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (role_id, domain_id),
        INDEX idx_crd_domain (domain_id),
        INDEX idx_crd_role (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created/verified table: career_role_domains');

    // 4. Create student_saved_roles table (Favorites)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_saved_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(64) NOT NULL,
        role_id VARCHAR(100) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_student_role (student_id, role_id),
        INDEX idx_ssr_student (student_id),
        INDEX idx_ssr_role (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created/verified table: student_saved_roles');

    // 5. Create student_skill_assessments table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_skill_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(64) NOT NULL,
        role_id VARCHAR(100) NOT NULL,
        readiness_score INT NOT NULL DEFAULT 0,
        matched_skills JSON,
        missing_skills JSON,
        recommended_roadmap JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ssa_student (student_id),
        INDEX idx_ssa_role (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created/verified table: student_skill_assessments');

    // 6. Ensure all required columns exist on pre-existing tables
    async function ensureColumn(tableName, colName, colDef) {
      const [cols] = await conn.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [colName]);
      if (cols.length === 0) {
        console.log(`✓ Adding missing column '${colName}' to table '${tableName}'...`);
        await conn.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${colName}\` ${colDef}`);
      }
    }

    await ensureColumn('career_domains', 'family', 'VARCHAR(100) NOT NULL DEFAULT \'Software & Web Engineering\'');
    await ensureColumn('career_domains', 'short_description', 'TEXT');
    await ensureColumn('career_domains', 'overview', 'TEXT');
    await ensureColumn('career_domains', 'what_professionals_do', 'JSON');
    await ensureColumn('career_domains', 'core_technologies', 'JSON');
    await ensureColumn('career_domains', 'prerequisites', 'JSON');
    await ensureColumn('career_domains', 'related_domains', 'JSON');
    await ensureColumn('career_domains', 'career_progression', 'TEXT');
    await ensureColumn('career_domains', 'sort_order', 'INT DEFAULT 0');
    await ensureColumn('career_domains', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    await ensureColumn('career_roles', 'level', 'VARCHAR(64) DEFAULT \'Entry-Level / Graduate\'');
    await ensureColumn('career_roles', 'is_beginner_friendly', 'BOOLEAN DEFAULT TRUE');
    await ensureColumn('career_roles', 'short_description', 'TEXT');
    await ensureColumn('career_roles', 'scope', 'TEXT');
    await ensureColumn('career_roles', 'deliverables', 'JSON');
    await ensureColumn('career_roles', 'career_readiness', 'JSON');
    await ensureColumn('career_roles', 'related_roles', 'JSON');
    await ensureColumn('career_roles', 'alternative_titles', 'JSON');
    await ensureColumn('career_roles', 'what_professional_does', 'TEXT');
    await ensureColumn('career_roles', 'why_role_exists', 'TEXT');
    await ensureColumn('career_roles', 'problems_solved', 'JSON');
    await ensureColumn('career_roles', 'educational_qualifications', 'TEXT');
    await ensureColumn('career_roles', 'prerequisites', 'TEXT');
    await ensureColumn('career_roles', 'certifications', 'JSON');
    await ensureColumn('career_roles', 'industry_applications', 'JSON');
    await ensureColumn('career_roles', 'career_progression', 'TEXT');
    await ensureColumn('career_roles', 'salary_insight', 'JSON');
    await ensureColumn('career_roles', 'market_demand', 'TEXT');
    await ensureColumn('career_roles', 'onet_code', 'VARCHAR(50)');
    await ensureColumn('career_roles', 'verification_standard', 'VARCHAR(255)');
    await ensureColumn('career_roles', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Load master domain dataset from client
    const domainsPath = path.join(__dirname, '../../../client/src/data/masterCareerDomains.js');
    const rolesPath = path.join(__dirname, '../../../client/src/data/masterCareerRoles.js');

    const { CAREER_DOMAINS } = await import(`file://${domainsPath.replace(/\\/g, '/')}`);
    const { MASTER_CAREER_ROLES } = await import(`file://${rolesPath.replace(/\\/g, '/')}`);

    // Clean up legacy placeholder records that are not part of the 38 IT catalogue
    const validDomainIds = CAREER_DOMAINS.map((d) => d.id);
    const validRoleIds = MASTER_CAREER_ROLES.map((r) => r.id);

    if (validDomainIds.length > 0) {
      await conn.query('DELETE FROM career_domains WHERE id NOT IN (?)', [validDomainIds]);
    }
    if (validRoleIds.length > 0) {
      await conn.query('DELETE FROM career_roles WHERE id NOT IN (?)', [validRoleIds]);
      await conn.query('DELETE FROM career_role_domains WHERE role_id NOT IN (?)', [validRoleIds]);
    }

    console.log(`\n📦 Importing ${CAREER_DOMAINS.length} career domains into SQL...`);
    for (const d of CAREER_DOMAINS) {
      await conn.query(
        `INSERT INTO career_domains (
          id, name, family, icon, short_description, overview,
          what_professionals_do, core_technologies, prerequisites,
          related_domains, career_progression, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          family = VALUES(family),
          icon = VALUES(icon),
          short_description = VALUES(short_description),
          overview = VALUES(overview),
          what_professionals_do = VALUES(what_professionals_do),
          core_technologies = VALUES(core_technologies),
          prerequisites = VALUES(prerequisites),
          related_domains = VALUES(related_domains),
          career_progression = VALUES(career_progression),
          sort_order = VALUES(sort_order)`,
        [
          d.id,
          d.name,
          d.family || 'Software & Web Engineering',
          d.icon || 'Compass',
          d.shortDescription || '',
          d.overview || '',
          JSON.stringify(d.whatProfessionalsDo || []),
          JSON.stringify(d.coreTechnologies || []),
          JSON.stringify(d.prerequisites || []),
          JSON.stringify(d.relatedDomains || []),
          d.careerProgression || '',
          d.sortOrder || 0
        ]
      );
    }
    console.log(`✓ Successfully seeded all ${CAREER_DOMAINS.length} career domains.`);

    console.log(`\n📦 Importing ${MASTER_CAREER_ROLES.length} IT career roles into SQL...`);
    let roleOrder = 1;
    for (const r of MASTER_CAREER_ROLES) {
      await conn.query(
        `INSERT INTO career_roles (
          id, title, category, tags, level, is_beginner_friendly,
          short_description, scope, responsibilities, deliverables,
          technical_skills, soft_skills, tools, stats,
          career_readiness, roadmap, projects, interview_questions,
          top_hiring_companies, related_roles, sort_order,
          alternative_titles, what_professional_does, why_role_exists,
          problems_solved, educational_qualifications, prerequisites,
          certifications, industry_applications, career_progression,
          salary_insight, market_demand, onet_code, verification_standard
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          sort_order = VALUES(sort_order),
          alternative_titles = VALUES(alternative_titles),
          what_professional_does = VALUES(what_professional_does),
          why_role_exists = VALUES(why_role_exists),
          problems_solved = VALUES(problems_solved),
          educational_qualifications = VALUES(educational_qualifications),
          prerequisites = VALUES(prerequisites),
          certifications = VALUES(certifications),
          industry_applications = VALUES(industry_applications),
          career_progression = VALUES(career_progression),
          salary_insight = VALUES(salary_insight),
          market_demand = VALUES(market_demand),
          onet_code = VALUES(onet_code),
          verification_standard = VALUES(verification_standard)`,
        [
          r.id,
          r.title,
          r.category,
          JSON.stringify(r.tags || []),
          r.level || 'Entry-Level / Graduate',
          r.isBeginnerFriendly !== false ? 1 : 0,
          r.shortDescription || '',
          r.scope || '',
          JSON.stringify(r.responsibilities || []),
          JSON.stringify(r.deliverables || []),
          JSON.stringify(r.technicalSkills || []),
          JSON.stringify(r.softSkills || []),
          JSON.stringify(r.tools || []),
          JSON.stringify(r.stats || {}),
          JSON.stringify(r.careerReadiness || {}),
          JSON.stringify(r.roadmap || []),
          JSON.stringify(r.projects || {}),
          JSON.stringify(r.interviewQuestions || []),
          JSON.stringify(r.topHiringCompanies || []),
          JSON.stringify(r.relatedRoles || []),
          roleOrder++,
          JSON.stringify(r.alternativeTitles || []),
          r.whatProfessionalDoes || '',
          r.whyRoleExists || '',
          JSON.stringify(r.problemsSolved || []),
          r.educationalQualifications || '',
          r.prerequisites || '',
          JSON.stringify(r.certifications || {}),
          JSON.stringify(r.industryApplications || []),
          r.careerProgression || '',
          JSON.stringify(r.salaryInsight || {}),
          r.marketDemand || '',
          r.onetCode || '',
          r.verificationStandard || ''
        ]
      );

      // Seed cross-domain mappings
      const domainIds = Array.isArray(r.domainIds) && r.domainIds.length > 0
        ? r.domainIds
        : [r.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')];

      for (let idx = 0; idx < domainIds.length; idx++) {
        const domId = domainIds[idx];
        await conn.query(
          `INSERT INTO career_role_domains (role_id, domain_id, is_primary)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary)`,
          [r.id, domId, idx === 0 ? 1 : 0]
        );
      }
    }
    console.log(`✓ Successfully seeded all ${MASTER_CAREER_ROLES.length} career roles and cross-domain links.`);

    console.log('================================================================');
    console.log('✅ [MIGRATION COMPLETE] All 38 Career Domains & Roles Ready in MySQL!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

if (require.main === module) {
  runCareerExplorerMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runCareerExplorerMigration };
