/**
 * CampusCorp RDS Database Importer
 * 
 * Imports all 16 database SQL dumps into target AWS RDS MySQL instance.
 * Preserves character sets, collations, auto-increments, stored routines, and triggers.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('../../backend/node_modules/mysql2/promise');

const DUMP_DIR = path.join(__dirname, '../../backups/pre_migration');
const MANIFEST_PATH = path.join(DUMP_DIR, 'manifest.json');
const MYSQL_BIN = 'C:\\xampp\\mysql\\bin\\mysql.exe';

const targetConfig = {
  host: process.env.AWS_RDS_HOST || process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.AWS_RDS_PORT || process.env.DB_PORT || '3306', 10),
  user: process.env.AWS_RDS_USER || process.env.DB_USER || 'root',
  password: process.env.AWS_RDS_PASSWORD !== undefined ? process.env.AWS_RDS_PASSWORD : (process.env.DB_PASSWORD || ''),
};

async function run() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('Manifest not found. Run backup_all_databases.js first.');
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`================================================================`);
  console.log(`Starting Database Import to RDS: ${targetConfig.host}:${targetConfig.port}`);
  console.log(`Total Databases to Import: ${Object.keys(manifest.databases).length}`);
  console.log(`================================================================`);

  // Connect to target RDS instance to ensure databases exist
  const connection = await mysql.createConnection({
    host: targetConfig.host,
    port: targetConfig.port,
    user: targetConfig.user,
    password: targetConfig.password,
  });

  for (const [dbName, dbMeta] of Object.entries(manifest.databases)) {
    console.log(`\n[1/2] Ensuring database \`${dbName}\` exists on target...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    const sqlFilePath = path.join(DUMP_DIR, `${dbName}.sql`);
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Dump file missing: ${sqlFilePath}`);
    }

    console.log(`[2/2] Importing ${dbMeta.file} (${(dbMeta.sizeBytes / 1024).toFixed(1)} KB) into \`${dbName}\`...`);
    const pwdFlag = targetConfig.password ? `-p"${targetConfig.password}"` : '';
    const importCmd = `"${MYSQL_BIN}" -h ${targetConfig.host} -P ${targetConfig.port} -u ${targetConfig.user} ${pwdFlag} ${dbName} < "${sqlFilePath}"`;

    try {
      execSync(importCmd, { stdio: 'inherit' });
      console.log(`✓ Successfully imported \`${dbName}\`.`);
    } catch (err) {
      console.error(`❌ Error importing \`${dbName}\`:`, err.message);
      throw err;
    }
  }

  await connection.end();
  console.log('\n================================================================');
  console.log('✅ ALL 16 DATABASES IMPORTED SUCCESSFULLY TO TARGET SERVER');
  console.log('Now run restore_and_validate_rds.js to verify row counts.');
  console.log('================================================================');
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
