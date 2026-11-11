const { queryPlatform, testCollegeDbConnection } = require('../config/platformDb');
const { queryTenant, tenantPools } = require('../config/tenantConnectionManager');
const { invalidateEntitlementCache } = require('../middleware/moduleEntitlementGuard');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const os = require('os');

/**
 * Record a platform administrative audit action
 */
async function recordAuditLog({ platformUserId = null, collegeId = null, action, entityType, entityId = null, details = null, ipAddress = null }) {
  try {
    const detailsJson = details ? JSON.stringify(details) : null;
    await queryPlatform(
      `INSERT INTO platform_audit_logs (platform_user_id, college_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [platformUserId, collegeId, action, entityType, entityId ? String(entityId) : null, detailsJson, ipAddress]
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR]:', err);
  }
}

/**
 * Get comprehensive SaaS Platform Overview
 */
async function getPlatformOverview() {
  // 1. College status counts
  const collegeCounts = await queryPlatform(`
    SELECT 
      COUNT(*) AS total_colleges,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_colleges,
      SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) AS suspended_colleges,
      SUM(CASE WHEN status = 'PROVISIONING' THEN 1 ELSE 0 END) AS provisioning_colleges,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_colleges
    FROM colleges
  `);

  // 2. Database registry counts and health
  const dbCounts = await queryPlatform(`
    SELECT 
      COUNT(*) AS total_databases,
      SUM(CASE WHEN health_status = 'HEALTHY' THEN 1 ELSE 0 END) AS healthy_databases,
      SUM(CASE WHEN health_status = 'DEGRADED' THEN 1 ELSE 0 END) AS degraded_databases,
      SUM(CASE WHEN health_status = 'OFFLINE' THEN 1 ELSE 0 END) AS offline_databases,
      AVG(CASE WHEN latency_ms > 0 THEN latency_ms ELSE NULL END) AS avg_latency_ms
    FROM college_database_registry
  `);

  // 3. Subscription distribution
  const subBreakdown = await queryPlatform(`
    SELECT sp.plan_code, sp.plan_name, COUNT(cs.id) AS active_count
    FROM subscription_plans sp
    LEFT JOIN college_subscriptions cs ON cs.plan_id = sp.id AND cs.status = 'ACTIVE'
    GROUP BY sp.id, sp.plan_code, sp.plan_name
  `);

  // 4. Recent audit logs
  const recentLogs = await queryPlatform(`
    SELECT 
      al.id, al.action, al.entity_type, al.entity_id, al.created_at, al.ip_address,
      pu.first_name, pu.last_name, pu.email AS admin_email,
      c.name AS college_name, c.code AS college_code
    FROM platform_audit_logs al
    LEFT JOIN platform_users pu ON pu.id = al.platform_user_id
    LEFT JOIN colleges c ON c.id = al.college_id
    ORDER BY al.created_at DESC
    LIMIT 8
  `);

  // 5. Recent registered colleges
  const recentColleges = await queryPlatform(`
    SELECT c.id, c.uuid, c.code, c.name, c.type, c.subdomain, c.status, c.created_at,
           cdr.database_name, cdr.health_status, cdr.latency_ms,
           sp.plan_name AS current_plan
    FROM colleges c
    LEFT JOIN college_database_registry cdr ON cdr.college_id = c.id
    LEFT JOIN college_subscriptions cs ON cs.college_id = c.id AND cs.status = 'ACTIVE'
    LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
    ORDER BY c.created_at DESC
    LIMIT 6
  `);

  // 6. Aggregate Total Students and Faculty across all provisioned college databases
  let totalStudents = 0;
  let totalFaculty = 0;
  const provisionedDbs = await queryPlatform(
    'SELECT college_id, database_name FROM college_database_registry WHERE is_provisioned = 1'
  );

  for (const db of provisionedDbs) {
    try {
      const studentCount = await queryTenant(db.college_id, 'SELECT COUNT(*) AS total FROM students_master');
      totalStudents += Number(studentCount[0]?.total || 0);

      const facultyCount = await queryTenant(db.college_id, "SELECT COUNT(*) AS total FROM users WHERE role_name IN ('FACULTY_COORDINATOR', 'MANAGEMENT')");
      totalFaculty += Number(facultyCount[0]?.total || 0);
    } catch (e) {
      // Gracefully continue if tenant DB is initializing
    }
  }

  // 7. Enabled Modules Count
  const moduleCounts = await queryPlatform(
    'SELECT COUNT(*) AS total_enabled FROM college_module_entitlements WHERE is_enabled = 1'
  );
  const catalogModules = await queryPlatform(
    'SELECT COUNT(*) AS catalog_total FROM platform_modules WHERE is_active = 1'
  );

  return {
    metrics: {
      colleges: {
        total: Number(collegeCounts[0]?.total_colleges || 0),
        active: Number(collegeCounts[0]?.active_colleges || 0),
        suspended: Number(collegeCounts[0]?.suspended_colleges || 0),
        provisioning: Number(collegeCounts[0]?.provisioning_colleges || 0),
        pending: Number(collegeCounts[0]?.pending_colleges || 0),
      },
      databases: {
        total: Number(dbCounts[0]?.total_databases || 0),
        healthy: Number(dbCounts[0]?.healthy_databases || 0),
        degraded: Number(dbCounts[0]?.degraded_databases || 0),
        offline: Number(dbCounts[0]?.offline_databases || 0),
        avgLatencyMs: Math.round(Number(dbCounts[0]?.avg_latency_ms || 0)),
      },
      subscriptions: subBreakdown,
      users: {
        totalStudents,
        totalFaculty,
      },
      modules: {
        totalEnabled: Number(moduleCounts[0]?.total_enabled || 0),
        catalogTotal: Number(catalogModules[0]?.catalog_total || 9),
      },
    },
    recentColleges,
    recentLogs,
  };
}

/**
 * List all colleges with search and status filtering
 */
async function getColleges({ search = '', status = '', type = '' } = {}) {
  let sql = `
    SELECT 
      c.id, c.uuid, c.code, c.name, c.type, c.subdomain, c.contact_email, c.contact_phone,
      c.status, c.created_at,
      cdr.id AS db_registry_id, cdr.database_name, cdr.health_status, cdr.latency_ms,
      sp.plan_code, sp.plan_name, cs.status AS subscription_status, cs.expiry_date AS subscription_expiry,
      (SELECT COUNT(*) FROM college_module_entitlements cme WHERE cme.college_id = c.id AND cme.is_enabled = 1) AS enabled_modules_count
    FROM colleges c
    LEFT JOIN college_database_registry cdr ON cdr.college_id = c.id
    LEFT JOIN college_subscriptions cs ON cs.college_id = c.id AND cs.status = 'ACTIVE'
    LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (c.name LIKE ? OR c.code LIKE ? OR c.subdomain LIKE ? OR c.contact_email LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  if (status) {
    sql += ` AND c.status = ?`;
    params.push(status);
  }

  if (type) {
    sql += ` AND c.type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY c.created_at DESC`;

  const colleges = await queryPlatform(sql, params);
  return colleges;
}

/**
 * Get single college full details
 */
async function getCollegeById(id) {
  const colleges = await queryPlatform(
    `SELECT id, uuid, code, name, type, affiliation, subdomain, contact_email, contact_phone, address, logo_url, status, created_at, updated_at
     FROM colleges WHERE id = ?`,
    [id]
  );

  if (colleges.length === 0) return null;
  const college = colleges[0];

  // Database registry
  const dbRows = await queryPlatform(
    `SELECT id, database_name, db_host, db_port, db_user, schema_version, is_provisioned, provisioned_at,
            last_health_check, health_status, latency_ms, database_size_bytes
     FROM college_database_registry WHERE college_id = ?`,
    [id]
  );
  college.database = dbRows[0] || null;

  // Active Subscription
  const subRows = await queryPlatform(
    `SELECT cs.id, cs.plan_id, cs.start_date, cs.expiry_date, cs.status, cs.custom_student_limit, cs.custom_storage_limit_gb, cs.notes,
            sp.plan_code, sp.plan_name, sp.max_students, sp.max_faculty, sp.price_per_year
     FROM college_subscriptions cs
     JOIN subscription_plans sp ON sp.id = cs.plan_id
     WHERE cs.college_id = ?
     ORDER BY cs.created_at DESC`,
    [id]
  );
  college.subscriptions = subRows;
  college.activeSubscription = subRows.find(s => s.status === 'ACTIVE') || subRows[0] || null;

  // Module Entitlements
  const modules = await queryPlatform(
    `SELECT pm.module_key, pm.module_name, pm.category, pm.description, pm.base_route,
            COALESCE(cme.is_enabled, 0) AS is_enabled, cme.feature_flags, cme.updated_at AS module_updated_at
     FROM platform_modules pm
     LEFT JOIN college_module_entitlements cme ON cme.module_key = pm.module_key AND cme.college_id = ?
     WHERE pm.is_active = 1
     ORDER BY pm.category, pm.module_name`,
    [id]
  );
  college.modules = modules.map(m => ({
    ...m,
    is_enabled: Boolean(m.is_enabled),
  }));

  // Recent Audit Logs
  const auditLogs = await queryPlatform(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details, al.ip_address, al.created_at,
            pu.first_name, pu.last_name, pu.email AS admin_email
     FROM platform_audit_logs al
     LEFT JOIN platform_users pu ON pu.id = al.platform_user_id
     WHERE al.college_id = ?
     ORDER BY al.created_at DESC
     LIMIT 10`,
    [id]
  );
  college.auditLogs = auditLogs;

  return college;
}

/**
 * Update college status (ACTIVE, SUSPENDED, ARCHIVED)
 */
async function updateCollegeStatus(collegeId, status, platformUserId, ipAddress) {
  const allowed = ['ACTIVE', 'SUSPENDED', 'ARCHIVED', 'PENDING'];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of ${allowed.join(', ')}`);
  }

  const [existing] = await queryPlatform('SELECT status, name, code FROM colleges WHERE id = ?', [collegeId]);
  if (!existing) {
    throw new Error('College not found.');
  }

  const previousStatus = existing.status;
  await queryPlatform('UPDATE colleges SET status = ?, updated_at = NOW() WHERE id = ?', [status, collegeId]);

  try {
    const { invalidateTenantCache } = require('../config/tenantConnectionManager');
    invalidateTenantCache(collegeId);
    invalidateTenantCache(existing.code);
    if (existing.subdomain) invalidateTenantCache(existing.subdomain);
  } catch (e) {
    console.warn('[INVALIDATE TENANT CACHE WARN]:', e.message);
  }

  if (status === 'SUSPENDED') {
    try {
      const { revokeAllCollegeSessions } = require('./sessionRevocationService');
      await revokeAllCollegeSessions(collegeId, 'Institutional suspension', 'Platform Super Admin');
    } catch (e) {
      console.warn('[SUSPEND REVOCATION WARN]:', e.message);
    }
  }

  await recordAuditLog({
    platformUserId,
    collegeId,
    action: 'COLLEGE_STATUS_UPDATED',
    entityType: 'COLLEGE',
    entityId: collegeId,
    details: { previousStatus, newStatus: status, collegeCode: existing.code, collegeName: existing.name },
    ipAddress,
  });

  return { success: true, previousStatus, newStatus: status };
}

/**
 * Get all registered college databases
 */
async function getDatabaseRegistry() {
  const dbs = await queryPlatform(`
    SELECT 
      cdr.id, cdr.college_id, cdr.database_name, cdr.db_host, cdr.db_port, cdr.db_user,
      cdr.schema_version, cdr.is_provisioned, cdr.provisioned_at, cdr.last_health_check,
      cdr.health_status, cdr.latency_ms, cdr.database_size_bytes, cdr.updated_at,
      c.name AS college_name, c.code AS college_code, c.subdomain, c.status AS college_status
    FROM college_database_registry cdr
    JOIN colleges c ON c.id = cdr.college_id
    ORDER BY cdr.health_status ASC, c.name ASC
  `);
  return dbs;
}

/**
 * Test real-time connection to a college database and record metrics
 */
async function pingCollegeDatabase(registryId, platformUserId, ipAddress) {
  const rows = await queryPlatform(
    `SELECT cdr.*, c.name AS college_name, c.code AS college_code
     FROM college_database_registry cdr
     JOIN colleges c ON c.id = cdr.college_id
     WHERE cdr.id = ?`,
    [registryId]
  );

  if (rows.length === 0) {
    throw new Error('Database registry entry not found.');
  }

  const registry = rows[0];
  const pingResult = await testCollegeDbConnection({
    host: registry.db_host,
    port: registry.db_port,
    user: registry.db_user,
    database: registry.database_name,
  });

  const newHealthStatus = pingResult.healthy ? 'HEALTHY' : 'OFFLINE';
  const latency = pingResult.latencyMs;

  await queryPlatform(
    `UPDATE college_database_registry
     SET health_status = ?, latency_ms = ?, last_health_check = NOW()
     WHERE id = ?`,
    [newHealthStatus, latency, registryId]
  );

  await recordAuditLog({
    platformUserId,
    collegeId: registry.college_id,
    action: 'DATABASE_PING_TESTED',
    entityType: 'DATABASE_REGISTRY',
    entityId: registryId,
    details: {
      databaseName: registry.database_name,
      collegeCode: registry.college_code,
      healthStatus: newHealthStatus,
      latencyMs: latency,
      error: pingResult.error || null,
      tableCount: pingResult.tableCount || 0,
    },
    ipAddress,
  });

  return {
    id: registryId,
    databaseName: registry.database_name,
    healthStatus: newHealthStatus,
    latencyMs: latency,
    tableCount: pingResult.tableCount || 0,
    error: pingResult.error || null,
    testedAt: new Date().toISOString(),
  };
}

/**
 * Get all platform modules catalog
 */
async function getPlatformModules() {
  const modules = await queryPlatform(
    'SELECT id, module_key, module_name, description, base_route, category, is_active FROM platform_modules ORDER BY category, module_name'
  );
  return modules;
}

/**
 * Update module entitlements for a specific college
 */
async function updateCollegeModules(collegeId, moduleKeysMap, platformUserId, ipAddress) {
  // moduleKeysMap: { [module_key]: boolean }
  const keys = Object.keys(moduleKeysMap);
  for (const key of keys) {
    const isEnabled = Boolean(moduleKeysMap[key]);
    await queryPlatform(
      `INSERT INTO college_module_entitlements (college_id, module_key, is_enabled, updated_by_platform_user, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled), updated_by_platform_user = VALUES(updated_by_platform_user), updated_at = NOW()`,
      [collegeId, key, isEnabled, platformUserId]
    );
  }

  await recordAuditLog({
    platformUserId,
    collegeId,
    action: 'COLLEGE_MODULES_UPDATED',
    entityType: 'MODULE_ENTITLEMENTS',
    entityId: collegeId,
    details: { updatedModules: moduleKeysMap },
    ipAddress,
  });

  invalidateEntitlementCache(collegeId);

  return { success: true, updatedCount: keys.length };
}

/**
 * Get standard subscription plans
 */
async function getSubscriptionPlans() {
  const plans = await queryPlatform('SELECT * FROM subscription_plans ORDER BY price_per_year ASC');
  return plans;
}

/**
 * Update or assign subscription for a college
 */
async function updateCollegeSubscription(collegeId, { planId, expiryDate, customStudentLimit, notes }, platformUserId, ipAddress) {
  // Set existing active subscriptions to EXPIRED if assigning new one
  await queryPlatform(
    `UPDATE college_subscriptions SET status = 'EXPIRED' WHERE college_id = ? AND status = 'ACTIVE'`,
    [collegeId]
  );

  const subRes = await queryPlatform(
    `INSERT INTO college_subscriptions (college_id, plan_id, start_date, expiry_date, status, custom_student_limit, notes)
     VALUES (?, ?, CURDATE(), ?, 'ACTIVE', ?, ?)`,
    [collegeId, planId, expiryDate, customStudentLimit || null, notes || null]
  );

  await recordAuditLog({
    platformUserId,
    collegeId,
    action: 'COLLEGE_SUBSCRIPTION_UPDATED',
    entityType: 'SUBSCRIPTION',
    entityId: subRes.insertId,
    details: { planId, expiryDate, customStudentLimit, notes },
    ipAddress,
  });

  return { success: true, subscriptionId: subRes.insertId };
}

/**
 * Create a new platform subscription plan
 */
async function createSubscriptionPlan(planData, platformUserId, ipAddress) {
  const { plan_code, plan_name, description, max_students, max_faculty, max_storage_gb, price_per_year } = planData;
  const cleanCode = plan_code.toUpperCase().trim();
  const insertRes = await queryPlatform(`
    INSERT INTO subscription_plans (plan_code, plan_name, description, max_students, max_faculty, max_storage_gb, price_per_year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      plan_name = VALUES(plan_name),
      description = VALUES(description),
      max_students = VALUES(max_students),
      max_faculty = VALUES(max_faculty),
      max_storage_gb = VALUES(max_storage_gb),
      price_per_year = VALUES(price_per_year)
  `, [
    cleanCode,
    plan_name.trim(),
    description || '',
    parseInt(max_students, 10) || 1000,
    parseInt(max_faculty, 10) || 100,
    parseInt(max_storage_gb, 10) || 50,
    parseFloat(price_per_year) || 0.00
  ]);

  let planId = insertRes.insertId;
  if (!planId) {
    const rows = await queryPlatform('SELECT id FROM subscription_plans WHERE plan_code = ?', [cleanCode]);
    planId = rows[0]?.id;
  }

  await recordAuditLog({
    platformUserId,
    action: 'SUBSCRIPTION_PLAN_CREATED',
    entityType: 'SUBSCRIPTION_PLAN',
    entityId: planId,
    details: { plan_code: cleanCode, plan_name, price_per_year },
    ipAddress,
  });

  return { success: true, planId };
}

/**
 * Update an existing platform subscription plan
 */
async function updateSubscriptionPlan(planId, planData, platformUserId, ipAddress) {
  const { plan_name, description, max_students, max_faculty, max_storage_gb, price_per_year } = planData;
  await queryPlatform(`
    UPDATE subscription_plans
    SET plan_name = ?, description = ?, max_students = ?, max_faculty = ?, max_storage_gb = ?, price_per_year = ?
    WHERE id = ?
  `, [
    plan_name,
    description || '',
    parseInt(max_students, 10),
    parseInt(max_faculty, 10),
    parseInt(max_storage_gb, 10),
    parseFloat(price_per_year),
    planId
  ]);

  await recordAuditLog({
    platformUserId,
    action: 'SUBSCRIPTION_PLAN_UPDATED',
    entityType: 'SUBSCRIPTION_PLAN',
    entityId: planId,
    details: planData,
    ipAddress,
  });

  return { success: true, planId };
}

/**
 * Delete a platform subscription plan
 */
async function deleteSubscriptionPlan(planId, platformUserId, ipAddress) {
  // Check if any active college is assigned this plan
  const [activeSubs] = await queryPlatform('SELECT COUNT(*) AS count FROM college_subscriptions WHERE plan_id = ? AND status = "ACTIVE"', [planId]);
  if (activeSubs?.count > 0) {
    throw new Error(`Cannot delete plan: ${activeSubs.count} active college(s) are currently subscribed to it.`);
  }

  await queryPlatform('DELETE FROM subscription_plans WHERE id = ?', [planId]);

  await recordAuditLog({
    platformUserId,
    action: 'SUBSCRIPTION_PLAN_DELETED',
    entityType: 'SUBSCRIPTION_PLAN',
    entityId: planId,
    details: { planId },
    ipAddress,
  });

  return { success: true, planId };
}

/**
 * Get invoices / billing records for a specific college
 */
async function getCollegeInvoices(collegeId) {
  const invoices = await queryPlatform(`
    SELECT ci.*, sp.plan_name, sp.plan_code
    FROM college_invoices ci
    LEFT JOIN subscription_plans sp ON sp.id = ci.plan_id
    WHERE ci.college_id = ?
    ORDER BY ci.created_at DESC
  `, [collegeId]);
  return invoices;
}

/**
 * Generate a new invoice for a college
 */
async function createCollegeInvoice(collegeId, invoiceData, platformUserId, ipAddress) {
  const { plan_id, amount_inr, tax_inr = 0, status = 'PAID', payment_method = 'BANK_TRANSFER', due_date = null } = invoiceData;
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const totalInr = parseFloat(amount_inr) + parseFloat(tax_inr);

  const res = await queryPlatform(`
    INSERT INTO college_invoices
      (college_id, plan_id, invoice_number, amount_inr, tax_inr, total_inr, status, payment_method, paid_at, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    collegeId,
    plan_id || null,
    invoiceNumber,
    parseFloat(amount_inr),
    parseFloat(tax_inr),
    totalInr,
    status,
    payment_method,
    status === 'PAID' ? new Date() : null,
    due_date || new Date(Date.now() + 30 * 86400 * 1000)
  ]);

  await recordAuditLog({
    platformUserId,
    collegeId,
    action: 'COLLEGE_INVOICE_GENERATED',
    entityType: 'INVOICE',
    entityId: res.insertId,
    details: { invoiceNumber, totalInr, status },
    ipAddress,
  });

  return { success: true, invoiceId: res.insertId, invoiceNumber, totalInr };
}

/**
 * Student Quota Enforcement: Verify if a college is within its subscription student cap
 */
async function checkStudentQuota(collegeId) {
  // 1. Get college subscription cap
  const rows = await queryPlatform(`
    SELECT 
      c.id, c.code, c.name, cs.status AS subscription_status,
      cs.custom_student_limit, sp.max_students AS plan_max_students,
      COALESCE(cs.custom_student_limit, sp.max_students, 1000) AS effective_student_cap
    FROM colleges c
    LEFT JOIN college_subscriptions cs ON cs.college_id = c.id AND cs.status = 'ACTIVE'
    LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
    WHERE c.id = ?
  `, [collegeId]);

  if (rows.length === 0) {
    throw new Error(`College ID ${collegeId} not found.`);
  }

  const college = rows[0];
  const maxStudents = college.effective_student_cap;

  // 2. Count active students in tenant database
  let currentStudents = 0;
  try {
    const studentRows = await queryTenant(collegeId, 'SELECT COUNT(*) AS total FROM students_master');
    currentStudents = studentRows[0]?.total || 0;
  } catch (err) {
    console.warn(`[QUOTA CHECK] Could not query students for college ${collegeId}: ${err.message}`);
  }

  const isWithinQuota = currentStudents < maxStudents;
  const remainingQuota = Math.max(0, maxStudents - currentStudents);
  const usagePercentage = maxStudents > 0 ? Math.min(100, Math.round((currentStudents / maxStudents) * 100)) : 0;

  return {
    collegeId: college.id,
    collegeCode: college.code,
    collegeName: college.name,
    currentStudents,
    maxStudents,
    isWithinQuota,
    remainingQuota,
    usagePercentage,
    subscriptionStatus: college.subscription_status || 'UNKNOWN',
  };
}

/**
 * Cluster Telemetry & System Resource Diagnostics
 */
async function getClusterTelemetry() {
  const memUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // Connection pools status
  const activePoolNames = Array.from(tenantPools.keys());

  // Run live ping diagnostic across all registered tenant databases in parallel
  const databases = await queryPlatform(`
    SELECT cdr.id, cdr.database_name, cdr.health_status, cdr.latency_ms, cdr.last_health_check,
           c.name AS college_name, c.code AS college_code
    FROM college_database_registry cdr
    JOIN colleges c ON c.id = cdr.college_id
  `);

  const pingPromises = databases.map(async (db) => {
    const startTime = Date.now();
    try {
      const pingResult = await testCollegeDbConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database_name: db.database_name,
      });
      return {
        id: db.id,
        databaseName: db.database_name,
        collegeCode: db.college_code,
        collegeName: db.college_name,
        healthy: pingResult.healthy,
        latencyMs: pingResult.latencyMs,
        tableCount: pingResult.tableCount || 0,
      };
    } catch (err) {
      return {
        id: db.id,
        databaseName: db.database_name,
        collegeCode: db.college_code,
        collegeName: db.college_name,
        healthy: false,
        latencyMs: Date.now() - startTime,
        error: err.message,
      };
    }
  });

  const clusterPingResults = await Promise.all(pingPromises);
  const healthyCount = clusterPingResults.filter(r => r.healthy).length;
  const avgLatency = clusterPingResults.length > 0
    ? Math.round(clusterPingResults.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / clusterPingResults.length)
    : 0;

  return {
    process: {
      uptimeSeconds,
      uptimeFormatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
      memory: {
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
      pid: process.pid,
    },
    system: {
      platform: os.platform(),
      cpus: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    },
    cluster: {
      totalDatabases: databases.length,
      healthyDatabases: healthyCount,
      degradedDatabases: databases.length - healthyCount,
      averageLatencyMs: avgLatency,
      activePoolsCached: activePoolNames.length,
      activePoolNames,
      nodes: clusterPingResults,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Storage utilization per college schema
 */
async function getClusterStorageUsage() {
  const rows = await queryPlatform(`
    SELECT 
      c.id AS college_id, c.code AS college_code, c.name AS college_name,
      cdr.database_name, sp.max_storage_gb,
      ROUND(COALESCE(SUM(t.data_length + t.index_length) / 1024 / 1024, 0), 2) AS storage_used_mb
    FROM colleges c
    JOIN college_database_registry cdr ON cdr.college_id = c.id
    LEFT JOIN college_subscriptions cs ON cs.college_id = c.id AND cs.status = 'ACTIVE'
    LEFT JOIN subscription_plans sp ON sp.id = cs.plan_id
    LEFT JOIN information_schema.tables t ON t.table_schema = cdr.database_name
    GROUP BY c.id, c.code, c.name, cdr.database_name, sp.max_storage_gb
    ORDER BY storage_used_mb DESC
  `);

  return rows.map(r => ({
    collegeId: r.college_id,
    collegeCode: r.college_code,
    collegeName: r.college_name,
    databaseName: r.database_name,
    storageUsedMb: parseFloat(r.storage_used_mb || 0),
    storageUsedGb: parseFloat((r.storage_used_mb / 1024).toFixed(3)),
    maxStorageGb: r.max_storage_gb || 50,
    usagePercentage: r.max_storage_gb ? Math.min(100, Math.round(((r.storage_used_mb / 1024) / r.max_storage_gb) * 100)) : 0,
  }));
}

/**
 * Export platform audit logs as RFC 4180 CSV
 */
async function exportAuditLogsToCsv({ action = '', entityType = '', startDate = '', endDate = '' } = {}) {
  let sql = `
    SELECT 
      al.id, al.created_at, al.action, al.entity_type, al.entity_id, al.ip_address,
      pu.email AS admin_email,
      c.code AS college_code,
      al.details
    FROM platform_audit_logs al
    LEFT JOIN platform_users pu ON pu.id = al.platform_user_id
    LEFT JOIN colleges c ON c.id = al.college_id
    WHERE 1=1
  `;
  const params = [];

  if (action) {
    sql += ` AND al.action = ?`;
    params.push(action);
  }
  if (entityType) {
    sql += ` AND al.entity_type = ?`;
    params.push(entityType);
  }
  if (startDate) {
    sql += ` AND al.created_at >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    sql += ` AND al.created_at <= ?`;
    params.push(endDate);
  }

  sql += ` ORDER BY al.created_at DESC LIMIT 1000`;
  const rows = await queryPlatform(sql, params);

  // Build CSV
  const headers = ['Log ID', 'Timestamp', 'Admin Email', 'Action', 'Entity Type', 'Entity ID', 'College Code', 'IP Address', 'Details'];
  const lines = [headers.join(',')];

  for (const r of rows) {
    const safeDetails = r.details ? `"${String(r.details).replace(/"/g, '""')}"` : '""';
    const row = [
      r.id,
      `"${new Date(r.created_at).toISOString()}"`,
      `"${r.admin_email || 'SYSTEM'}"`,
      `"${r.action}"`,
      `"${r.entity_type}"`,
      `"${r.entity_id || ''}"`,
      `"${r.college_code || ''}"`,
      `"${r.ip_address || ''}"`,
      safeDetails,
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Get Platform Audit Logs
 */
async function getPlatformAuditLogs({ page = 1, limit = 50, action = '', entityType = '' } = {}) {
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  let sql = `
    SELECT 
      al.id, al.action, al.entity_type, al.entity_id, al.details, al.ip_address, al.created_at,
      pu.first_name, pu.last_name, pu.email AS admin_email,
      c.name AS college_name, c.code AS college_code
    FROM platform_audit_logs al
    LEFT JOIN platform_users pu ON pu.id = al.platform_user_id
    LEFT JOIN colleges c ON c.id = al.college_id
    WHERE 1=1
  `;
  const params = [];

  if (action) {
    sql += ` AND al.action = ?`;
    params.push(action);
  }

  if (entityType) {
    sql += ` AND al.entity_type = ?`;
    params.push(entityType);
  }

  sql += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const logs = await queryPlatform(sql, params);

  // Total count
  const countSql = `SELECT COUNT(*) AS total FROM platform_audit_logs al WHERE 1=1` +
    (action ? ` AND al.action = '${action}'` : '') +
    (entityType ? ` AND al.entity_type = '${entityType}'` : '');
  const [totalRows] = await queryPlatform(countSql);

  return {
    logs,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total: totalRows?.total || 0,
      totalPages: Math.ceil((totalRows?.total || 0) / parseInt(limit, 10)),
    },
  };
}

/**
 * Get and update global platform settings
 */
async function getPlatformSettings() {
  const settings = await queryPlatform('SELECT * FROM platform_settings ORDER BY category, setting_key');
  return settings;
}

async function updatePlatformSettings(settingsArray, platformUserId, ipAddress) {
  for (const item of settingsArray) {
    await queryPlatform(
      'UPDATE platform_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?',
      [String(item.setting_value), item.setting_key]
    );
  }

  await recordAuditLog({
    platformUserId,
    action: 'PLATFORM_SETTINGS_UPDATED',
    entityType: 'SETTINGS',
    details: { updatedKeys: settingsArray.map(s => s.setting_key) },
    ipAddress,
  });

  return { success: true };
}

/**
 * Update general college information
 */
async function updateCollegeDetails(collegeId, payload, platformUserId = null, ipAddress = null) {
  const { name, type, affiliation, contact_email, contact_phone, address } = payload;

  const colleges = await queryPlatform('SELECT * FROM colleges WHERE id = ?', [collegeId]);
  if (colleges.length === 0) {
    throw new Error('College not found.');
  }

  await queryPlatform(
    `UPDATE colleges
     SET name = COALESCE(?, name),
         type = COALESCE(?, type),
         affiliation = COALESCE(?, affiliation),
         contact_email = COALESCE(?, contact_email),
         contact_phone = COALESCE(?, contact_phone),
         address = COALESCE(?, address),
         updated_at = NOW()
     WHERE id = ?`,
    [
      name ? name.trim() : null,
      type || null,
      affiliation ? affiliation.trim() : null,
      contact_email ? contact_email.trim() : null,
      contact_phone ? contact_phone.trim() : null,
      address ? address.trim() : null,
      collegeId,
    ]
  );

  await recordAuditLog({
    platformUserId,
    collegeId,
    action: 'COLLEGE_DETAILS_UPDATED',
    entityType: 'COLLEGE',
    entityId: collegeId,
    details: { name, type, contact_email },
    ipAddress,
  });

  return { success: true, message: 'College information successfully updated.' };
}

/**
 * List all Platform Users
 */
async function getPlatformUsers() {
  const users = await queryPlatform(`
    SELECT id, uuid, email, first_name, last_name, role, status, sessions_revoked_before, created_at, updated_at
    FROM platform_users
    ORDER BY created_at DESC
  `);
  return users;
}

/**
 * Create a new Platform Administrator
 */
async function createPlatformAdminUser({ email, password, first_name, last_name, role = 'PLATFORM_SUPER_ADMIN' }, platformUserId = null, ipAddress = null) {
  if (!email || !password || !first_name || !last_name) {
    throw new Error('Email, password, first name and last name are required.');
  }

  const existing = await queryPlatform('SELECT id FROM platform_users WHERE email = ?', [email.trim().toLowerCase()]);
  if (existing.length > 0) {
    throw new Error(`Platform user with email '${email}' already exists.`);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const userUuid = crypto.randomUUID();

  const result = await queryPlatform(
    `INSERT INTO platform_users (uuid, email, password_hash, first_name, last_name, role, status)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    [userUuid, email.trim().toLowerCase(), passwordHash, first_name.trim(), last_name.trim(), role]
  );

  const newId = result.insertId;

  await recordAuditLog({
    platformUserId,
    action: 'PLATFORM_USER_CREATED',
    entityType: 'PLATFORM_USER',
    entityId: newId,
    details: { email, first_name, last_name, role },
    ipAddress,
  });

  return { id: newId, uuid: userUuid, email, first_name, last_name, role, status: 'ACTIVE' };
}

/**
 * Activate / Suspend a Platform Administrator
 */
async function updatePlatformUserStatus(userId, status, platformUserId = null, ipAddress = null) {
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    throw new Error('Status must be ACTIVE or SUSPENDED.');
  }

  await queryPlatform(
    'UPDATE platform_users SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, userId]
  );

  await recordAuditLog({
    platformUserId,
    action: 'PLATFORM_USER_STATUS_UPDATED',
    entityType: 'PLATFORM_USER',
    entityId: userId,
    details: { status },
    ipAddress,
  });

  return { success: true, message: `Platform user status updated to ${status}.` };
}

/**
 * Force revoke active sessions for a Platform Administrator
 */
async function revokePlatformUserSessions(userId, reason = 'Administrative revocation', platformUserId = null, ipAddress = null) {
  await queryPlatform(
    'UPDATE platform_users SET sessions_revoked_before = NOW() WHERE id = ?',
    [userId]
  );

  await recordAuditLog({
    platformUserId,
    action: 'PLATFORM_USER_SESSIONS_REVOKED',
    entityType: 'PLATFORM_USER',
    entityId: userId,
    details: { reason },
    ipAddress,
  });

  return { success: true, message: `Active sessions for platform user ID ${userId} have been revoked.` };
}

/**
 * Unified directory of all institutional college administrators across all provisioned colleges
 */
async function getAllCollegeAdminsDirectory({ search = '', collegeId = null } = {}) {
  let collegeSql = `
    SELECT c.id, c.code, c.name, c.subdomain, c.status AS college_status,
           cdr.database_name, cdr.health_status, cdr.is_provisioned
    FROM colleges c
    LEFT JOIN college_database_registry cdr ON cdr.college_id = c.id
    WHERE cdr.is_provisioned = 1
  `;
  const collegeParams = [];
  if (collegeId) {
    collegeSql += ' AND c.id = ?';
    collegeParams.push(collegeId);
  }
  collegeSql += ' ORDER BY c.name ASC';

  const colleges = await queryPlatform(collegeSql, collegeParams);
  const directory = [];

  for (const c of colleges) {
    try {
      let userSql = `
        SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, u.role_name, u.status, u.created_at, u.sessions_revoked_before
        FROM users u
        WHERE u.role_name IN ('SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER')
      `;
      const userParams = [];
      if (search) {
        userSql += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
        const s = `%${search}%`;
        userParams.push(s, s, s);
      }
      userSql += ' ORDER BY u.role_name ASC, u.first_name ASC';

      const users = await queryTenant(c.id, userSql, userParams);
      for (const u of users) {
        directory.push({
          userId: u.id,
          userUuid: u.uuid,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
          roleName: u.role_name,
          status: u.status,
          sessionsRevokedBefore: u.sessions_revoked_before,
          createdAt: u.created_at,
          collegeId: c.id,
          collegeCode: c.code,
          collegeName: c.name,
          subdomain: c.subdomain,
          databaseName: c.database_name,
        });
      }
    } catch (err) {
      console.warn(`[COLLEGE ADMIN DIRECTORY WARN] Could not query users for ${c.code}:`, err.message);
    }
  }

  return directory;
}

/**
 * Retry or re-run provisioning / migration on a college database
 */
async function retryCollegeProvisioning(collegeId, platformUserId = null, ipAddress = null) {
  const colleges = await queryPlatform(
    `SELECT c.*, cdr.database_name, cdr.db_host, cdr.db_port, cdr.db_user, cdr.is_provisioned
     FROM colleges c
     LEFT JOIN college_database_registry cdr ON cdr.college_id = c.id
     WHERE c.id = ?`,
    [collegeId]
  );

  if (colleges.length === 0) {
    throw new Error('College not found.');
  }

  const college = colleges[0];
  const result = await pingCollegeDatabase(college.id, platformUserId, ipAddress);

  await queryPlatform(
    "UPDATE colleges SET status = 'ACTIVE' WHERE id = ? AND status != 'ACTIVE'",
    [collegeId]
  );
  await queryPlatform(
    "UPDATE college_database_registry SET is_provisioned = 1, health_status = 'HEALTHY' WHERE college_id = ?",
    [collegeId]
  );

  await recordAuditLog({
    platformUserId,
    collegeId,
    action: 'COLLEGE_PROVISIONING_RETRIED',
    entityType: 'COLLEGE',
    entityId: collegeId,
    details: { databaseName: college.database_name, status: 'HEALTHY' },
    ipAddress,
  });

  return { success: true, message: `Provisioning refreshed and database verified for '${college.name}'.`, health: result };
}

module.exports = {
  recordAuditLog,
  getPlatformOverview,
  getColleges,
  getCollegeById,
  updateCollegeStatus,
  updateCollegeDetails,
  getDatabaseRegistry,
  pingCollegeDatabase,
  retryCollegeProvisioning,
  getPlatformModules,
  updateCollegeModules,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  updateCollegeSubscription,
  getCollegeInvoices,
  createCollegeInvoice,
  checkStudentQuota,
  getClusterTelemetry,
  getClusterStorageUsage,
  getPlatformAuditLogs,
  exportAuditLogsToCsv,
  getPlatformSettings,
  updatePlatformSettings,
  getPlatformUsers,
  createPlatformAdminUser,
  updatePlatformUserStatus,
  revokePlatformUserSessions,
  getAllCollegeAdminsDirectory,
};

