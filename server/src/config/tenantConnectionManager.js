const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { AsyncLocalStorage } = require('async_hooks');
const { queryPlatform } = require('./platformDb');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const tenantStorage = new AsyncLocalStorage();

const defaultDbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_TENANT_POOL_MAX || '15', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Map of active database connection pools: database_name -> mysql.Pool
const tenantPools = new Map();

// In-memory cache of tenant metadata: identifier -> { metadata, expiresAt }
const metadataCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Resolve tenant metadata from central platform registry
 * @param {string|number} identifier - College ID, Code (e.g. 'KCT'), or Subdomain (e.g. 'kct')
 * @returns {Promise<object>}
 */
async function resolveTenantMetadata(identifier) {
  if (!identifier) {
    throw new Error('Tenant identifier (ID, code, or subdomain) is required.');
  }

  const cacheKey = String(identifier).trim().toUpperCase();
  const cached = metadataCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const isNumeric = !isNaN(identifier) && !isNaN(parseFloat(identifier));
  let sql = `
    SELECT 
      c.id, c.uuid, c.code, c.name, c.type, c.affiliation, c.subdomain, c.contact_email, c.logo_url, c.status,
      cdr.database_name, cdr.db_host, cdr.db_port, cdr.db_user, cdr.is_provisioned, cdr.health_status
    FROM colleges c
    LEFT JOIN college_database_registry cdr ON cdr.college_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (isNumeric) {
    sql += ` AND (c.id = ? OR c.code = ? OR c.subdomain = ? OR cdr.database_name = ?)`;
    params.push(parseInt(identifier, 10), String(identifier), String(identifier).toLowerCase(), String(identifier));
  } else {
    sql += ` AND (c.code = ? OR c.subdomain = ? OR cdr.database_name = ?)`;
    params.push(String(identifier).toUpperCase(), String(identifier).toLowerCase(), String(identifier));
  }

  const rows = await queryPlatform(sql, params);

  if (rows.length === 0) {
    // If not found in platform registry, fallback check for flagship 'CAMPUS_MAIN' or default 'lms'
    if (cacheKey === 'CAMPUS_MAIN' || cacheKey === 'MAIN' || cacheKey === 'LMS' || cacheKey === 'DEFAULT') {
      const fallbackData = {
        id: 1,
        uuid: '11111111-1111-1111-1111-111111111111',
        code: 'CAMPUS_MAIN',
        name: 'CampusCorp Flagship Institution',
        type: 'AUTONOMOUS',
        affiliation: 'CampusCorp Educational Consortium',
        subdomain: 'main',
        contact_email: 'contact@campuscorp.edu',
        logo_url: '/logo-light.jpeg',
        status: 'ACTIVE',
        database_name: process.env.DB_COMMON_NAME || 'lms',
        db_host: defaultDbConfig.host,
        db_port: defaultDbConfig.port,
        db_user: defaultDbConfig.user,
        is_provisioned: 1,
        health_status: 'HEALTHY',
      };
      metadataCache.set(cacheKey, { data: fallbackData, expiresAt: Date.now() + CACHE_TTL_MS });
      return fallbackData;
    }

    throw new Error(`Institution tenant '${identifier}' is not registered in CampusCorp SaaS Hub.`);
  }

  const tenant = rows[0];

  if (tenant.status !== 'ACTIVE') {
    const err = new Error(`Institution '${tenant.name}' (${tenant.code}) is currently ${tenant.status.toLowerCase()}.`);
    err.tenantStatus = tenant.status;
    err.code = tenant.status === 'SUSPENDED' ? 'COLLEGE_SUSPENDED' : 'COLLEGE_INACTIVE';
    throw err;
  }

  if (!tenant.database_name || !tenant.is_provisioned) {
    throw new Error(`Institution '${tenant.name}' (${tenant.code}) does not have an active provisioned database.`);
  }

  // Cache by ID, Code, Subdomain, and Database Name
  const cacheObj = { data: tenant, expiresAt: Date.now() + CACHE_TTL_MS };
  metadataCache.set(String(tenant.id), cacheObj);
  metadataCache.set(tenant.code.toUpperCase(), cacheObj);
  if (tenant.subdomain) {
    metadataCache.set(tenant.subdomain.toUpperCase(), cacheObj);
  }
  if (tenant.database_name) {
    metadataCache.set(tenant.database_name.toUpperCase(), cacheObj);
  }

  return tenant;
}

/**
 * Get or initialize connection pool for a specific college tenant database
 * @param {string|number} identifier - College ID, Code, Subdomain, or Database Name
 * @returns {Promise<mysql.Pool>}
 */
async function getTenantPool(identifier) {
  if (typeof identifier === 'string' && tenantPools.has(identifier)) {
    return tenantPools.get(identifier);
  }

  const metadata = await resolveTenantMetadata(identifier);
  const dbName = metadata.database_name;

  if (tenantPools.has(dbName)) {
    return tenantPools.get(dbName);
  }

  const pool = mysql.createPool({
    ...defaultDbConfig,
    host: metadata.db_host || defaultDbConfig.host,
    port: parseInt(metadata.db_port || defaultDbConfig.port, 10),
    user: metadata.db_user || defaultDbConfig.user,
    database: dbName,
  });

  tenantPools.set(dbName, pool);
  console.log(`✓ [TENANT CONNECTION MANAGER] Initialized dedicated connection pool for \`${dbName}\` (${metadata.code})`);
  return pool;
}

/**
 * Execute query against a specific college tenant database
 * @param {string|number} identifier - College ID, Code, or Subdomain
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
async function queryTenant(identifier, sql, params = []) {
  const pool = await getTenantPool(identifier);
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Real-time health check on a specific tenant database pool
 * @param {string|number} identifier
 * @returns {Promise<{ healthy: boolean, latencyMs: number, database: string }>}
 */
async function checkTenantHealth(identifier) {
  const startTime = Date.now();
  try {
    const pool = await getTenantPool(identifier);
    const [rows] = await pool.query('SELECT 1 AS alive');
    const latencyMs = Date.now() - startTime;
    return {
      healthy: rows && rows[0]?.alive === 1,
      latencyMs,
      database: (await resolveTenantMetadata(identifier)).database_name,
    };
  } catch (err) {
    return {
      healthy: false,
      latencyMs: Date.now() - startTime,
      error: err.message,
    };
  }
}

/**
 * Invalidate metadata cache (e.g. after status change or subscription update)
 */
function invalidateTenantCache(identifier) {
  if (identifier) {
    metadataCache.delete(String(identifier).trim().toUpperCase());
  } else {
    metadataCache.clear();
  }
}

module.exports = {
  resolveTenantMetadata,
  getTenantPool,
  queryTenant,
  checkTenantHealth,
  invalidateTenantCache,
  tenantPools,
  tenantStorage,
  getTenantStorage: () => tenantStorage,
};

