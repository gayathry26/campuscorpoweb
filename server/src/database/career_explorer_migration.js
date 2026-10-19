const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_COMMON_NAME || 'lms',
};

async function runCareerExplorerMigration() {
  console.log('================================================================');
  console.log('🚀 [MIGRATION] Setting up Career Explorer SQL Tables & Dataset...');
  console.log('================================================================');

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // 1. Create career_domains table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS career_domains (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table career_domains');

    // 2. Create career_roles table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS career_roles (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        tags JSON,
        short_description TEXT,
        scope TEXT,
        responsibilities JSON,
        technical_skills JSON,
        soft_skills JSON,
        tools JSON,
        stats JSON,
        projects JSON,
        certifications JSON,
        roadmap JSON,
        interview_questions JSON,
        top_hiring_companies JSON,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role_cat (category)
      ) ENGINE=InnoDB
    `);
    console.log('✓ Created/verified table career_roles');

    // 3. Load dataset from client/src/data/itRoles.js
    const itRolesPath = path.join(__dirname, '../../../client/src/data/itRoles.js');
    const { IT_ROLES, DOMAIN_CATEGORIES } = await import(`file://${itRolesPath.replace(/\\/g, '/')}`);

    // Seed Domains
    console.log(`Seeding ${DOMAIN_CATEGORIES.length} domains into career_domains...`);
    const domainDescriptions = {
      'Software Development': 'Full-stack engineering, web applications, systems architecture, and scalable software pipelines.',
      'Data Science & Analytics': 'Predictive analytics, data warehouses, business intelligence, and big data transformations.',
      'Artificial Intelligence & Machine Learning': 'Deep learning, LLMs, neural networks, computer vision, and intelligent automation.',
      'Cybersecurity': 'Network defense, penetration testing, threat hunting, vulnerability governance, and cryptography.',
      'Cloud Computing & DevOps': 'Container orchestration, CI/CD pipelines, cloud architectures, and infrastructure-as-code.',
      'UI/UX & Design': 'User research, interaction architecture, design systems, wireframing, and Figma prototyping.',
      'Networking': 'Enterprise routing, switching, cloud networking, firewalls, and datacenter infrastructure.',
      'Testing & Quality Assurance': 'Automated regression test frameworks, performance stress-testing, and QA pipelines.',
      'Business Analysis': 'Requirement engineering, agile ceremonies, process optimization, and stakeholder bridging.',
      'Product Management': 'Product lifecycle management, PRDs, roadmapping, MVP discovery, and user growth strategy.',
      'Emerging Technologies': 'Decentralized smart contracts, blockchain protocols, Web3 architectures, and distributed ledgers.'
    };

    let domainOrder = 1;
    for (const catName of DOMAIN_CATEGORIES) {
      if (catName === 'All Domains') continue;
      const domainId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const desc = domainDescriptions[catName] || `${catName} specialized career track and industry domain competencies.`;

      await conn.query(
        `INSERT INTO career_domains (id, name, description, sort_order)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           sort_order = VALUES(sort_order)`,
        [domainId, catName, desc, domainOrder++]
      );
    }
    console.log(`✓ Seeded ${domainOrder - 1} domains.`);

    // Seed Career Roles
    console.log(`Seeding ${IT_ROLES.length} roles into career_roles...`);
    let roleOrder = 1;
    for (const role of IT_ROLES) {
      await conn.query(
        `INSERT INTO career_roles (
          id, title, category, tags, short_description, scope,
          responsibilities, technical_skills, soft_skills, tools,
          stats, projects, certifications, roadmap, interview_questions,
          top_hiring_companies, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          category = VALUES(category),
          tags = VALUES(tags),
          short_description = VALUES(short_description),
          scope = VALUES(scope),
          responsibilities = VALUES(responsibilities),
          technical_skills = VALUES(technical_skills),
          soft_skills = VALUES(soft_skills),
          tools = VALUES(tools),
          stats = VALUES(stats),
          projects = VALUES(projects),
          certifications = VALUES(certifications),
          roadmap = VALUES(roadmap),
          interview_questions = VALUES(interview_questions),
          top_hiring_companies = VALUES(top_hiring_companies),
          sort_order = VALUES(sort_order)`,
        [
          role.id,
          role.title,
          role.category,
          JSON.stringify(role.tags || []),
          role.shortDescription || '',
          role.scope || '',
          JSON.stringify(role.responsibilities || []),
          JSON.stringify(role.technicalSkills || []),
          JSON.stringify(role.softSkills || []),
          JSON.stringify(role.tools || []),
          JSON.stringify(role.stats || {}),
          JSON.stringify(role.projects || {}),
          JSON.stringify(role.certifications || []),
          JSON.stringify(role.roadmap || []),
          JSON.stringify(role.interviewQuestions || []),
          JSON.stringify(role.topHiringCompanies || []),
          roleOrder++
        ]
      );
    }
    console.log(`✓ Seeded ${IT_ROLES.length} career roles successfully into career_roles.`);

    console.log('================================================================');
    console.log('✅ [MIGRATION COMPLETE] Career Explorer SQL Tables Ready!');
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
