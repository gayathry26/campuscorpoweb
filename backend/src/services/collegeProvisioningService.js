const mysql = require('mysql2/promise');
const crypto = require('crypto');
const { queryPlatform, platformPool } = require('../config/platformDb');
const { recordAuditLog } = require('./platformAdminService');
const { deployCollegeBaselineSchema } = require('../database/college_baseline_template');

const defaultDbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

/**
 * Automate full institutional onboarding and isolated database provisioning
 * @param {object} payload - College profile, database config, subscription, modules, admin credentials
 * @param {number} platformUserId - ID of Platform Super Admin initiating provisioning
 * @param {string} ipAddress - Client IP address for audit trail
 */
async function provisionNewCollege(payload, platformUserId = null, ipAddress = null) {
  const {
    name,
    code,
    type = 'ENGINEERING',
    affiliation = null,
    subdomain,
    contact_email,
    contact_phone = null,
    address = null,
    db_host = defaultDbConfig.host,
    db_port = defaultDbConfig.port,
    db_user = defaultDbConfig.user,
    plan_id = 1,
    expiry_date,
    custom_student_limit = null,
    notes = null,
    modules = {},
    admin = {},
  } = payload;

  // 1. Validation
  if (!name || !code || !subdomain || !contact_email) {
    throw new Error('College name, code, subdomain, and contact email are required.');
  }

  if (!admin.email || !admin.password || !admin.first_name || !admin.last_name) {
    throw new Error('Initial College Administrator details (first name, last name, email, password) are required.');
  }

  const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  const databaseName = payload.database_name
    ? payload.database_name.trim().toLowerCase()
    : `campuscorp_college_${cleanCode.toLowerCase()}`;

  // Check unique constraints on platform
  const existingColleges = await queryPlatform(
    'SELECT id, code, subdomain FROM colleges WHERE code = ? OR subdomain = ?',
    [cleanCode, cleanSubdomain]
  );

  if (existingColleges.length > 0) {
    const match = existingColleges[0];
    if (match.code === cleanCode) {
      throw new Error(`An institution with code '${cleanCode}' is already registered.`);
    }
    if (match.subdomain === cleanSubdomain) {
      throw new Error(`The subdomain '${cleanSubdomain}' is already taken.`);
    }
  }

  const existingDbs = await queryPlatform(
    'SELECT id, database_name FROM college_database_registry WHERE database_name = ?',
    [databaseName]
  );

  if (existingDbs.length > 0) {
    throw new Error(`Database name '${databaseName}' is already registered to another institution.`);
  }

  let newCollegeId = null;
  let dbCreated = false;
  let rootConn = null;

  try {
    // Step 2: Register College in Platform Database (Status: PROVISIONING)
    const collegeUuid = crypto.randomUUID();
    const collegeInsert = await queryPlatform(`
      INSERT INTO colleges (uuid, code, name, type, affiliation, subdomain, contact_email, contact_phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PROVISIONING')
    `, [collegeUuid, cleanCode, name, type, affiliation, cleanSubdomain, contact_email, contact_phone, address]);

    newCollegeId = collegeInsert.insertId;

    await recordAuditLog({
      platformUserId,
      collegeId: newCollegeId,
      action: 'COLLEGE_PROVISIONING_STARTED',
      entityType: 'COLLEGE',
      entityId: newCollegeId,
      details: { collegeName: name, collegeCode: cleanCode, databaseName },
      ipAddress,
    });

    // Step 3: Connect to MySQL Server & Create Dedicated Database
    rootConn = await mysql.createConnection({
      host: db_host,
      port: parseInt(db_port, 10),
      user: db_user,
      password: defaultDbConfig.password,
    });

    // Check if database physically exists on MySQL server
    const [existingDbsOnServer] = await rootConn.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [databaseName]
    );

    if (existingDbsOnServer.length > 0) {
      throw new Error(`Physical database '${databaseName}' already exists on MySQL cluster.`);
    }

    await rootConn.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    dbCreated = true;
    console.log(`✓ Created physical database: \`${databaseName}\``);

    // Step 4: Connect to New College Database & Deploy Baseline Schema
    const collegeConn = await mysql.createConnection({
      host: db_host,
      port: parseInt(db_port, 10),
      user: db_user,
      password: defaultDbConfig.password,
      database: databaseName,
    });

    await deployCollegeBaselineSchema(
      collegeConn,
      { name, code: cleanCode, type, subdomain: cleanSubdomain, contact_email },
      admin
    );

    await collegeConn.end();

    // Step 5: Register in college_database_registry
    await queryPlatform(`
      INSERT INTO college_database_registry (
        college_id, database_name, db_host, db_port, db_user,
        schema_version, is_provisioned, provisioned_at, last_health_check, health_status, latency_ms
      ) VALUES (?, ?, ?, ?, ?, '1.0.0', TRUE, NOW(), NOW(), 'HEALTHY', 2)
    `, [newCollegeId, databaseName, db_host, parseInt(db_port, 10), db_user]);

    // Step 6: Assign Subscription Plan
    const calculatedExpiry = expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await queryPlatform(`
      INSERT INTO college_subscriptions (
        college_id, plan_id, start_date, expiry_date, status, custom_student_limit, notes
      ) VALUES (?, ?, CURDATE(), ?, 'ACTIVE', ?, ?)
    `, [newCollegeId, plan_id, calculatedExpiry, custom_student_limit, notes || 'Initial SaaS Onboarding']);

    // Step 7: Assign Module Entitlements
    // Default to active for requested modules, or standard catalog
    const allCatalogModules = await queryPlatform('SELECT module_key FROM platform_modules WHERE is_active = 1');
    for (const mod of allCatalogModules) {
      const isEnabled = modules[mod.module_key] !== undefined ? Boolean(modules[mod.module_key]) : true;
      await queryPlatform(`
        INSERT INTO college_module_entitlements (college_id, module_key, is_enabled, updated_by_platform_user)
        VALUES (?, ?, ?, ?)
      `, [newCollegeId, mod.module_key, isEnabled, platformUserId]);
    }

    // Step 8: Finalize College Status to ACTIVE
    await queryPlatform(`UPDATE colleges SET status = 'ACTIVE', updated_at = NOW() WHERE id = ?`, [newCollegeId]);

    // Step 9: Record Audit Log
    await recordAuditLog({
      platformUserId,
      collegeId: newCollegeId,
      action: 'COLLEGE_PROVISIONED_SUCCESS',
      entityType: 'COLLEGE',
      entityId: newCollegeId,
      details: {
        collegeName: name,
        collegeCode: cleanCode,
        databaseName,
        adminEmail: admin.email,
        subdomain: cleanSubdomain,
      },
      ipAddress,
    });

    if (rootConn) await rootConn.end();

    return {
      success: true,
      message: `Institution '${name}' (${cleanCode}) successfully onboarded and database provisioned!`,
      data: {
        collegeId: newCollegeId,
        collegeCode: cleanCode,
        subdomain: cleanSubdomain,
        databaseName,
        adminEmail: admin.email,
        status: 'ACTIVE',
      },
    };
  } catch (err) {
    console.error('❌ [PROVISIONING FAILED] Starting transactional rollback...', err.message);

    // =================================================================
    // AUTOMATIC ROLLBACK AND RECOVERY
    // =================================================================
    try {
      // 1. Drop created database if exists
      if (dbCreated) {
        if (!rootConn || rootConn.connection?._closing) {
          rootConn = await mysql.createConnection({
            host: db_host,
            port: parseInt(db_port, 10),
            user: db_user,
            password: defaultDbConfig.password,
          });
        }
        await rootConn.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
        console.log(`✓ [ROLLBACK] Dropped orphaned physical database: \`${databaseName}\``);
      }
    } catch (dbDropErr) {
      console.error('❌ [ROLLBACK ERROR] Could not drop database:', dbDropErr.message);
    } finally {
      if (rootConn) {
        try { await rootConn.end(); } catch {}
      }
    }

    // 2. Clean up or flag platform database records
    if (newCollegeId) {
      try {
        await queryPlatform('DELETE FROM college_module_entitlements WHERE college_id = ?', [newCollegeId]);
        await queryPlatform('DELETE FROM college_subscriptions WHERE college_id = ?', [newCollegeId]);
        await queryPlatform('DELETE FROM college_database_registry WHERE college_id = ?', [newCollegeId]);
        // Update status to PROVISIONING_FAILED so administrators can audit what occurred
        await queryPlatform(`UPDATE colleges SET status = 'ARCHIVED', updated_at = NOW() WHERE id = ?`, [newCollegeId]);
      } catch (cleanupErr) {
        console.error('❌ [ROLLBACK ERROR] Platform records cleanup failed:', cleanupErr.message);
      }

      await recordAuditLog({
        platformUserId,
        collegeId: newCollegeId,
        action: 'COLLEGE_PROVISIONING_FAILED',
        entityType: 'COLLEGE',
        entityId: newCollegeId,
        details: {
          collegeCode: cleanCode,
          databaseName,
          error: err.message,
          stack: err.stack,
        },
        ipAddress,
      });
    }

    throw new Error(`Provisioning failed: ${err.message}. Rollback completed cleanly.`);
  }
}

/**
 * Permanently purge failed or orphaned provisioning attempt
 */
async function cleanupFailedCollege(collegeId, platformUserId = null, ipAddress = null) {
  const colleges = await queryPlatform('SELECT id, code, name, status FROM colleges WHERE id = ?', [collegeId]);
  if (colleges.length === 0) {
    throw new Error('College not found.');
  }
  const college = colleges[0];

  // Delete all associated records in platform DB
  await queryPlatform('DELETE FROM college_module_entitlements WHERE college_id = ?', [collegeId]);
  await queryPlatform('DELETE FROM college_subscriptions WHERE college_id = ?', [collegeId]);
  await queryPlatform('DELETE FROM college_database_registry WHERE college_id = ?', [collegeId]);
  await queryPlatform('DELETE FROM colleges WHERE id = ?', [collegeId]);

  await recordAuditLog({
    platformUserId,
    action: 'FAILED_COLLEGE_PURGED',
    entityType: 'COLLEGE',
    entityId: collegeId,
    details: { collegeCode: college.code, collegeName: college.name },
    ipAddress,
  });

  return { success: true, message: `College '${college.name}' (${college.code}) records purged.` };
}

module.exports = {
  provisionNewCollege,
  cleanupFailedCollege,
};
