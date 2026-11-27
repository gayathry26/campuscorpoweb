const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { departmentSchemaTables } = require('../database/department_academic_migration');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const commonDbName = process.env.DB_COMMON_NAME || 'lms';

/**
 * Validate department code: 2-15 alphanumeric/underscore characters
 */
function validateDepartmentCode(deptCode) {
  if (!deptCode || typeof deptCode !== 'string') {
    throw new Error('Department code is required and must be a string.');
  }
  const cleanCode = deptCode.trim().toUpperCase();
  if (!/^[A-Z0-9_]{2,15}$/.test(cleanCode)) {
    throw new Error(`Invalid department code '${deptCode}'. Must be 2 to 15 uppercase alphanumeric characters (e.g., CSE, ECE, AI_DS).`);
  }
  return cleanCode;
}

/**
 * Deterministically generate safe database identifier
 * e.g., CSE -> campuscorp_dept_cse
 */
function generateDatabaseName(deptCode) {
  const cleanCode = validateDepartmentCode(deptCode);
  const dbSuffix = cleanCode.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const dbName = `campuscorp_dept_${dbSuffix}`;
  if (!/^[a-z0-9_]{3,64}$/.test(dbName)) {
    throw new Error(`Generated database name '${dbName}' is invalid.`);
  }
  return dbName;
}

/**
 * Sanitize SQL identifier for database names
 */
function sanitizeIdentifier(ident) {
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(ident)) {
    throw new Error(`Illegal MySQL identifier: '${ident}'`);
  }
  return ident;
}

/**
 * Provision an isolated department database and apply schema
 */
async function provisionDepartmentDatabase(deptData, userContext = null) {
  const deptCode = validateDepartmentCode(deptData.dept_code || deptData.code);
  const deptName = (deptData.dept_name || deptData.name || deptCode).trim();
  const description = deptData.description || `Department of ${deptName}`;
  const hodName = deptData.hod_name || null;
  const hodEmail = deptData.hod_email || null;
  const durationYears = parseInt(deptData.duration_years || 4, 10);
  const totalSemesters = parseInt(deptData.total_semesters || durationYears * 2, 10);

  // Check if department already exists with an assigned database
  const masterConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
  let targetDbName = null;
  try {
    const [existing] = await masterConn.query(
      'SELECT id, database_name, provisioning_status FROM department_databases WHERE dept_code = ?',
      [deptCode]
    );
    if (existing.length > 0 && existing[0].database_name) {
      targetDbName = existing[0].database_name;
    } else {
      targetDbName = generateDatabaseName(deptCode);
    }
  } finally {
    await masterConn.end();
  }

  const safeDbName = sanitizeIdentifier(targetDbName);

  // Update status in master to PROVISIONING
  const mConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
  try {
    await mConn.query(`
      INSERT INTO department_databases 
      (dept_code, dept_name, database_name, is_active, description, hod_name, hod_email, duration_years, total_semesters, provisioning_status, schema_version)
      VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 'PROVISIONING', '1.0.0')
      ON DUPLICATE KEY UPDATE
        dept_name = VALUES(dept_name),
        description = VALUES(description),
        hod_name = VALUES(hod_name),
        hod_email = VALUES(hod_email),
        duration_years = VALUES(duration_years),
        total_semesters = VALUES(total_semesters),
        provisioning_status = 'PROVISIONING'
    `, [deptCode, deptName, safeDbName, description, hodName, hodEmail, durationYears, totalSemesters]);
  } finally {
    await mConn.end();
  }

  // Provisioning execution
  let rootConn;
  let deptConn;
  try {
    // 1. Create database safely
    rootConn = await mysql.createConnection(dbConfig);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${safeDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConn.end();
    rootConn = null;

    // 2. Apply isolated department schema
    deptConn = await mysql.createConnection({ ...dbConfig, database: safeDbName });
    for (const tableSql of departmentSchemaTables) {
      await deptConn.query(tableSql);
    }

    // 3. Verify tables exist
    const [tables] = await deptConn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    const requiredTables = ['students', 'student_profiles', 'student_academic_records', 'classes', 'sections'];
    for (const reqT of requiredTables) {
      if (!tableNames.includes(reqT)) {
        throw new Error(`Verification failed: Table '${reqT}' was not created in '${safeDbName}'.`);
      }
    }

    // 4. Record audit in department database
    await deptConn.query(
      'INSERT INTO dept_audit_logs (action, performed_by, details) VALUES (?, ?, ?)',
      [
        'DATABASE_PROVISIONED',
        userContext?.email || 'System Administrator',
        `Provisioned schema v1.0.0 for ${deptCode} in ${safeDbName}`
      ]
    );
    await deptConn.end();
    deptConn = null;

    // 5. Update master database to READY
    const finalMasterConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
    try {
      await finalMasterConn.query(`
        UPDATE department_databases 
        SET provisioning_status = 'READY', 
            last_verified_at = NOW(), 
            last_error = NULL, 
            is_active = 1,
            schema_version = '1.0.0'
        WHERE dept_code = ?
      `, [deptCode]);

      // Master audit log
      await finalMasterConn.query(`
        INSERT INTO audit_logs (user_id, action, module, details)
        VALUES (?, 'DEPARTMENT_DATABASE_PROVISIONED', 'Department Management', ?)
      `, [
        userContext?.id || 1,
        `Successfully provisioned isolated database '${safeDbName}' for department ${deptCode} (${deptName})`
      ]);
    } finally {
      await finalMasterConn.end();
    }

    return {
      success: true,
      deptCode,
      deptName,
      databaseName: safeDbName,
      status: 'READY',
      tablesCreated: tableNames.length,
      verifiedAt: new Date().toISOString()
    };
  } catch (err) {
    if (rootConn) await rootConn.end().catch(() => {});
    if (deptConn) await deptConn.end().catch(() => {});

    // Update status to FAILED and record error in master
    const errConn = await mysql.createConnection({ ...dbConfig, database: commonDbName }).catch(() => null);
    if (errConn) {
      try {
        await errConn.query(`
          UPDATE department_databases 
          SET provisioning_status = 'FAILED', 
              last_error = ? 
          WHERE dept_code = ?
        `, [err.message, deptCode]);

        await errConn.query(`
          INSERT INTO audit_logs (user_id, action, module, details)
          VALUES (?, 'DEPARTMENT_DATABASE_PROVISION_FAILED', 'Department Management', ?)
        `, [
          userContext?.id || 1,
          `Failed provisioning database '${safeDbName}' for department ${deptCode}: ${err.message}`
        ]);
      } catch (logErr) {
        console.error('Failed to log provisioning error:', logErr);
      } finally {
        await errConn.end();
      }
    }

    throw new Error(`Failed to provision department database for '${deptCode}': ${err.message}`);
  }
}

/**
 * Verify a department database connection and schema health
 */
async function verifyDepartmentDatabase(deptCode) {
  const cleanCode = validateDepartmentCode(deptCode);
  const masterConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
  let deptRow = null;
  try {
    const [rows] = await masterConn.query(
      'SELECT * FROM department_databases WHERE dept_code = ?',
      [cleanCode]
    );
    if (rows.length === 0) {
      throw new Error(`Department '${cleanCode}' is not registered in department_databases.`);
    }
    deptRow = rows[0];
  } finally {
    await masterConn.end();
  }

  const dbName = sanitizeIdentifier(deptRow.database_name);
  const start = Date.now();
  let deptConn;
  try {
    deptConn = await mysql.createConnection({ ...dbConfig, database: dbName });
    await deptConn.query('SELECT 1');
    const latencyMs = Date.now() - start;

    const [tables] = await deptConn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);

    // Student and academic counts
    let studentCount = 0;
    let classCount = 0;
    try {
      const [sRes] = await deptConn.query('SELECT COUNT(*) AS cnt FROM students');
      studentCount = sRes[0].cnt;
    } catch (e) {}

    try {
      const [cRes] = await deptConn.query('SELECT COUNT(*) AS cnt FROM classes');
      classCount = cRes[0].cnt;
    } catch (e) {}

    await deptConn.end();

    // Update master with verification timestamp
    const mConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
    try {
      await mConn.query(
        'UPDATE department_databases SET last_verified_at = NOW(), provisioning_status = "READY", last_error = NULL WHERE dept_code = ?',
        [cleanCode]
      );
    } finally {
      await mConn.end();
    }

    return {
      deptCode: cleanCode,
      deptName: deptRow.dept_name,
      databaseName: dbName,
      status: 'UP',
      latencyMs,
      schemaVersion: deptRow.schema_version || '1.0.0',
      tablesCount: tableNames.length,
      tables: tableNames,
      studentCount,
      classCount,
      lastVerifiedAt: new Date().toISOString(),
      lastError: null
    };
  } catch (err) {
    if (deptConn) await deptConn.end().catch(() => {});
    
    // Update master with error
    const mConn = await mysql.createConnection({ ...dbConfig, database: commonDbName }).catch(() => null);
    if (mConn) {
      try {
        await mConn.query(
          'UPDATE department_databases SET last_error = ? WHERE dept_code = ?',
          [err.message, cleanCode]
        );
      } finally {
        await mConn.end();
      }
    }

    return {
      deptCode: cleanCode,
      deptName: deptRow.dept_name,
      databaseName: dbName,
      status: 'DOWN',
      latencyMs: null,
      schemaVersion: deptRow.schema_version || '1.0.0',
      tablesCount: 0,
      tables: [],
      studentCount: 0,
      classCount: 0,
      lastVerifiedAt: deptRow.last_verified_at,
      lastError: err.message
    };
  }
}

/**
 * Get comprehensive database health status for all departments
 */
async function getAllDepartmentDatabaseStatus() {
  const masterConn = await mysql.createConnection({ ...dbConfig, database: commonDbName });
  let departments = [];
  let commonLatency = 0;
  let commonStatus = 'DOWN';

  const startCommon = Date.now();
  try {
    await masterConn.query('SELECT 1');
    commonStatus = 'UP';
    commonLatency = Date.now() - startCommon;
    const [rows] = await masterConn.query(`
      SELECT dd.*,
             (SELECT COUNT(*) FROM academic_structures WHERE dept_code = dd.dept_code) AS academic_structures_count
      FROM department_databases dd
      ORDER BY dd.dept_code ASC
    `);
    departments = rows;
  } finally {
    await masterConn.end();
  }

  const deptStatuses = [];
  for (const dept of departments) {
    const verified = await verifyDepartmentDatabase(dept.dept_code);
    deptStatuses.push({
      ...dept,
      connectionStatus: verified.status,
      latencyMs: verified.latencyMs,
      tablesCount: verified.tablesCount,
      tables: verified.tables,
      studentCount: verified.studentCount,
      classCount: verified.classCount,
      lastError: verified.lastError || dept.last_error
    });
  }

  return {
    centralDatabase: {
      name: commonDbName,
      host: dbConfig.host,
      port: dbConfig.port,
      status: commonStatus,
      latencyMs: commonLatency,
      timestamp: new Date().toISOString()
    },
    departments: deptStatuses
  };
}

module.exports = {
  validateDepartmentCode,
  generateDatabaseName,
  provisionDepartmentDatabase,
  verifyDepartmentDatabase,
  getAllDepartmentDatabaseStatus,
};
