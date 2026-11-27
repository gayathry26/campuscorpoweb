const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const platformDbName = process.env.DB_PLATFORM_NAME || 'campuscorp_platform';

async function runPhase6AuthMigration() {
  console.log('================================================================');
  console.log('🔒 [PHASE 6 MIGRATION] Deploying Auth, RBAC & Revocation Tables');
  console.log('================================================================');

  const platformConn = await mysql.createConnection({ ...dbConfig, database: platformDbName });

  try {
    // 1. Create platform_revoked_tokens table
    console.log('Creating platform_revoked_tokens table in platform database...');
    await platformConn.query(`
      CREATE TABLE IF NOT EXISTS platform_revoked_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        token_type ENUM('PLATFORM', 'COLLEGE') DEFAULT 'COLLEGE',
        user_id INT NULL,
        college_id INT NULL,
        reason VARCHAR(255) DEFAULT 'User logged out',
        revoked_by VARCHAR(150) NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token_hash (token_hash),
        INDEX idx_college (college_id),
        INDEX idx_user (user_id),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB
    `);
    console.log('✓ platform_revoked_tokens table deployed.');

    // 2. Add sessions_revoked_before column to colleges table if not exists
    const [collegeCols] = await platformConn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'colleges' AND COLUMN_NAME = 'sessions_revoked_before'
    `, [platformDbName]);

    if (collegeCols.length === 0) {
      console.log('Adding sessions_revoked_before to colleges table...');
      await platformConn.query(`
        ALTER TABLE colleges
        ADD COLUMN sessions_revoked_before TIMESTAMP NULL DEFAULT NULL AFTER status
      `);
      console.log('✓ Added sessions_revoked_before to colleges table.');
    } else {
      console.log('✓ colleges.sessions_revoked_before already present.');
    }

    // 3. Add sessions_revoked_before column to platform_users table if not exists
    const [platformUserCols] = await platformConn.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'platform_users' AND COLUMN_NAME = 'sessions_revoked_before'
    `, [platformDbName]);

    if (platformUserCols.length === 0) {
      console.log('Adding sessions_revoked_before to platform_users table...');
      await platformConn.query(`
        ALTER TABLE platform_users
        ADD COLUMN sessions_revoked_before TIMESTAMP NULL DEFAULT NULL AFTER status
      `);
      console.log('✓ Added sessions_revoked_before to platform_users table.');
    } else {
      console.log('✓ platform_users.sessions_revoked_before already present.');
    }

    // 4. Update Flagship database 'lms' with users.sessions_revoked_before
    const commonDbName = process.env.DB_COMMON_NAME || 'lms';
    try {
      const commonConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
      const [lmsCols] = await commonConn.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'sessions_revoked_before'
      `, [commonDbName]);

      if (lmsCols.length === 0) {
        await commonConn.query(`
          ALTER TABLE users
          ADD COLUMN sessions_revoked_before TIMESTAMP NULL DEFAULT NULL
        `);
        console.log(`✓ Added sessions_revoked_before to \`${commonDbName}\`.users table.`);
      }
      await commonConn.end();
    } catch (e) {
      console.warn(`[WARN] Could not update \`${commonDbName}\`:`, e.message);
    }

    console.log('================================================================');
    console.log('🎉 [PHASE 6 MIGRATION COMPLETE] All Revocation Schemas Deployed!');
    console.log('================================================================');
    return true;
  } finally {
    await platformConn.end();
  }
}

if (require.main === module) {
  runPhase6AuthMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase6AuthMigration };

