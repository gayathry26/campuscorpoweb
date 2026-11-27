const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { MASTER_DOMAIN_KNOWLEDGE_STORE } = require('../data/masterDomainKnowledgeEngine');

const baseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function migrateDatabase(dbName) {
  console.log(`\n--- Migrating database: ${dbName} ---`);
  let conn;
  try {
    conn = await mysql.createConnection({ ...baseConfig, database: dbName });

    // 1. Create domain_knowledge_modules table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_knowledge_modules (
        id VARCHAR(120) PRIMARY KEY,
        domain_id VARCHAR(100) NOT NULL,
        module_number INT NOT NULL,
        module_title VARCHAR(255) NOT NULL,
        module_subtitle VARCHAR(255),
        description TEXT,
        estimated_minutes INT DEFAULT 45,
        is_published TINYINT(1) DEFAULT 1,
        content_json LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_dkm_domain (domain_id),
        INDEX idx_dkm_modnum (module_number),
        INDEX idx_dkm_published (is_published)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Create domain_knowledge_projects table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_knowledge_projects (
        id VARCHAR(120) PRIMARY KEY,
        domain_id VARCHAR(100) NOT NULL,
        level VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        objectives TEXT,
        architecture TEXT,
        technologies JSON,
        implementation_steps JSON,
        expected_output TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dkp_domain (domain_id),
        INDEX idx_dkp_level (level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Create domain_knowledge_interviews table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_knowledge_interviews (
        id VARCHAR(120) PRIMARY KEY,
        domain_id VARCHAR(100) NOT NULL,
        difficulty VARCHAR(32) NOT NULL,
        question TEXT NOT NULL,
        answer LONGTEXT NOT NULL,
        common_mistakes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dki_domain (domain_id),
        INDEX idx_dki_diff (difficulty)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Create domain_student_progress table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_student_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(64) NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'common',
        domain_id VARCHAR(100) NOT NULL,
        module_number INT NOT NULL,
        is_completed TINYINT(1) DEFAULT 0,
        last_read_topic VARCHAR(255),
        quiz_score INT DEFAULT 0,
        completed_at TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_student_domain_mod (student_id, domain_id, module_number),
        INDEX idx_dsp_student (student_id),
        INDEX idx_dsp_domain (domain_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Create domain_student_bookmarks table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_student_bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(64) NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'common',
        domain_id VARCHAR(100) NOT NULL,
        module_number INT NOT NULL,
        topic_title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_bookmark (student_id, domain_id, module_number, topic_title(100)),
        INDEX idx_dsb_student (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. Create domain_pdf_records table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_pdf_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain_id VARCHAR(100) NOT NULL,
        module_number INT NULL,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(255),
        file_size_bytes INT DEFAULT 0,
        download_count INT DEFAULT 0,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dpr_domain (domain_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. Create domain_content_versions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS domain_content_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain_id VARCHAR(100) NOT NULL,
        module_number INT NOT NULL,
        author_id VARCHAR(64),
        author_role VARCHAR(32) DEFAULT 'ADMIN',
        version_label VARCHAR(32) DEFAULT '1.0.0',
        status ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED') DEFAULT 'PUBLISHED',
        change_summary TEXT,
        content_snapshot LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_dcv_domain_mod (domain_id, module_number),
        INDEX idx_dcv_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log(`✓ Tables verified in ${dbName}`);

    // Seed domain_knowledge_modules
    const [modCountRows] = await conn.query('SELECT COUNT(*) as c FROM domain_knowledge_modules');
    if (modCountRows[0].c === 0) {
      console.log(`Seeding modules in ${dbName}...`);
      for (const domain of Object.values(MASTER_DOMAIN_KNOWLEDGE_STORE)) {
        for (const mod of domain.modules || []) {
          const modId = `${domain.id}-m${mod.moduleNumber}`;
          await conn.query(
            `INSERT INTO domain_knowledge_modules (id, domain_id, module_number, module_title, module_subtitle, description, estimated_minutes, is_published, content_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
             ON DUPLICATE KEY UPDATE module_title = VALUES(module_title), module_subtitle = VALUES(module_subtitle), content_json = VALUES(content_json)`,
            [
              modId,
              domain.id,
              mod.moduleNumber,
              mod.title,
              mod.subtitle || '',
              mod.subtitle || '',
              mod.estimatedMinutes || 45,
              JSON.stringify(mod)
            ]
          );
        }
      }
      console.log(`✓ Seeded modules for all domains in ${dbName}`);
    }

    // Seed domain_knowledge_projects
    const [projCountRows] = await conn.query('SELECT COUNT(*) as c FROM domain_knowledge_projects');
    if (projCountRows[0].c === 0) {
      console.log(`Seeding projects in ${dbName}...`);
      for (const domain of Object.values(MASTER_DOMAIN_KNOWLEDGE_STORE)) {
        for (const proj of domain.projects || []) {
          await conn.query(
            `INSERT INTO domain_knowledge_projects (id, domain_id, level, title, objectives, architecture, technologies, implementation_steps, expected_output)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), architecture = VALUES(architecture)`,
            [
              proj.id,
              domain.id,
              proj.level,
              proj.title,
              proj.problemStatement || '',
              proj.architectureOverview || '',
              JSON.stringify(proj.techStack || []),
              JSON.stringify(proj.stepByStepGuide || []),
              (proj.expectedDeliverables || []).join('\n')
            ]
          );
        }
      }
      console.log(`✓ Seeded practical projects in ${dbName}`);
    }

    // Seed domain_knowledge_interviews (Top 15 per domain to SQL for fast indexing)
    const [intCountRows] = await conn.query('SELECT COUNT(*) as c FROM domain_knowledge_interviews');
    if (intCountRows[0].c === 0) {
      console.log(`Seeding interview questions in ${dbName}...`);
      for (const domain of Object.values(MASTER_DOMAIN_KNOWLEDGE_STORE)) {
        const topInterviews = (domain.interviews || []).slice(0, 30);
        for (const item of topInterviews) {
          await conn.query(
            `INSERT INTO domain_knowledge_interviews (id, domain_id, difficulty, question, answer, common_mistakes)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE question = VALUES(question), answer = VALUES(answer)`,
            [
              item.id,
              domain.id,
              item.level,
              item.question,
              item.answer,
              (item.keyTakeaways || []).join('\n')
            ]
          );
        }
      }
      console.log(`✓ Seeded interview Q&As in ${dbName}`);
    }

  } catch (err) {
    console.error(`Error in ${dbName}:`, err.message);
  } finally {
    if (conn) await conn.end();
  }
}

async function runDomainKnowledgeHubMigration() {
  console.log('================================================================');
  console.log('🚀 [MIGRATION] Multi-Tenant Domain Knowledge Hub SQL Sync...');
  console.log('================================================================');

  const databases = [
    'lms',
    'campuscorp_college_abc',
    'campuscorp_college_amr',
    'campuscorp_college_cit',
    'campuscorp_college_kct',
    'campuscorp_college_psg',
    'campuscorp_college_xyz'
  ];

  for (const dbName of databases) {
    await migrateDatabase(dbName);
  }

  console.log('\n✅ [ALL DATABASES SYNCED] All Domain Knowledge Hub tables ready.');
}

if (require.main === module) {
  runDomainKnowledgeHubMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runDomainKnowledgeHubMigration };
