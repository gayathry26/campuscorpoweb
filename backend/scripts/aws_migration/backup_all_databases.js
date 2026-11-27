const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mysql = require('../../node_modules/mysql2/promise');

const DUMP_DIR = path.join(__dirname, '../../backups/pre_migration');
const MYSQLDUMP_PATH = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';

const DATABASES = [
  'campuscorp_platform',
  'lms',
  'lms_cse',
  'lms_ece',
  'lms_eee',
  'lms_mech',
  'lms_civil',
  'lms_it',
  'campuscorp_dept_aids',
  'campuscorp_dept_robotics',
  'campuscorp_college_abc',
  'campuscorp_college_amr',
  'campuscorp_college_cit',
  'campuscorp_college_kct',
  'campuscorp_college_psg',
  'campuscorp_college_xyz'
];

async function run() {
  if (!fs.existsSync(DUMP_DIR)) {
    fs.mkdirSync(DUMP_DIR, { recursive: true });
  }

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  console.log(`Starting automated pre-migration backup for ${DATABASES.length} databases...`);
  const manifest = {
    exportedAt: new Date().toISOString(),
    sourceHost: '127.0.0.1:3306 (XAMPP MariaDB/MySQL)',
    totalDatabases: DATABASES.length,
    databases: {},
    totalRows: 0,
    totalTables: 0,
    totalDumpSizeBytes: 0,
  };

  for (const dbName of DATABASES) {
    const sqlFilePath = path.join(DUMP_DIR, `${dbName}.sql`);
    console.log(`-> Exporting [${dbName}] to ${sqlFilePath}...`);

    // Use mysqldump with complete preservation flags
    const dumpCmd = `"${MYSQLDUMP_PATH}" -u root --routines --triggers --events --single-transaction --databases ${dbName} > "${sqlFilePath}"`;
    execSync(dumpCmd, { stdio: 'inherit' });

    // Calculate file stats and sha256 checksum
    const fileBuffer = fs.readFileSync(sqlFilePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const stats = fs.statSync(sqlFilePath);

    // Collect exact row counts per table for post-migration comparison
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [dbName]
    );

    const tableCounts = {};
    let dbTotalRows = 0;

    for (const t of tables) {
      const [cntRows] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${dbName}\`.\`${t.TABLE_NAME}\``);
      const cnt = Number(cntRows[0].cnt);
      tableCounts[t.TABLE_NAME] = cnt;
      dbTotalRows += cnt;
    }

    manifest.databases[dbName] = {
      file: `${dbName}.sql`,
      sizeBytes: stats.size,
      sha256: hash,
      tablesCount: tables.length,
      totalRows: dbTotalRows,
      tableCounts,
    };

    manifest.totalRows += dbTotalRows;
    manifest.totalTables += tables.length;
    manifest.totalDumpSizeBytes += stats.size;
    console.log(`   [${dbName}] complete: ${tables.length} tables, ${dbTotalRows} rows, ${(stats.size / 1024).toFixed(1)} KB`);
  }

  await connection.end();

  const manifestPath = path.join(DUMP_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('================================================================');
  console.log('ALL DATABASES SUCCESSFULLY BACKED UP');
  console.log(`Total Databases: ${manifest.totalDatabases}`);
  console.log(`Total Tables:    ${manifest.totalTables}`);
  console.log(`Total Rows:      ${manifest.totalRows}`);
  console.log(`Total Dump Size: ${(manifest.totalDumpSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Manifest File:   ${manifestPath}`);
  console.log('================================================================');
}

run().catch((err) => {
  console.error('Migration backup error:', err);
  process.exit(1);
});
