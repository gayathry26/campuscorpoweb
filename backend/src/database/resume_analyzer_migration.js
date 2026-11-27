/**
 * Database Migration: Resume Analyzer System
 * Creates `resume_analyses` table to store verified student evaluations
 */
const { queryCommon } = require('../config/db');

async function runResumeAnalyzerMigration() {
  console.log('[Migration] Checking and creating `resume_analyses` table...');

  await queryCommon(`
    CREATE TABLE IF NOT EXISTS resume_analyses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      student_id INT NULL,
      role_id VARCHAR(64) NOT NULL,
      role_title VARCHAR(128) NOT NULL,
      job_id INT NULL,
      original_filename VARCHAR(255) NOT NULL,
      file_format VARCHAR(16) NOT NULL,
      file_size_bytes INT NOT NULL,
      overall_score INT NOT NULL DEFAULT 0,
      job_match_score INT NOT NULL DEFAULT 0,
      analysis_json JSON NOT NULL,
      model_id VARCHAR(128) NOT NULL DEFAULT 'mistral-7b-instruct-v0.1.Q4_K_M',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ra_user_id (user_id),
      INDEX idx_ra_student_id (student_id),
      INDEX idx_ra_role_id (role_id),
      INDEX idx_ra_created_at (created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('[Migration] `resume_analyses` table initialized successfully.');
}

module.exports = { runResumeAnalyzerMigration };

if (require.main === module) {
  runResumeAnalyzerMigration()
    .then(() => {
      console.log('Resume Analyzer migration completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
