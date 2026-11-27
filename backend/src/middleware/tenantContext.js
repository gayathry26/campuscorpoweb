const jwt = require('jsonwebtoken');
const { resolveTenantMetadata, getTenantPool, queryTenant, tenantStorage } = require('../config/tenantConnectionManager');

/**
 * Extract tenant identifier from request through priority hierarchy:
 * 1. Authenticated user token claims (collegeId, collegeCode, dbName)
 * 2. Header: x-tenant-code / x-college-code
 * 3. Subdomain in Host header (e.g. kct.campuscorp.io -> kct)
 * 4. Request query or body (collegeCode / tenant)
 * 5. Default fallback: 'CAMPUS_MAIN'
 */
function extractTenantIdentifier(req) {
  // 1. Authenticated user claims
  if (req.user?.collegeId) return req.user.collegeId;
  if (req.user?.collegeCode) return req.user.collegeCode;

  // 1b. Check Bearer token payload for college claims prior to auth middleware
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      if (decoded && (decoded.collegeCode || decoded.collegeId)) {
        return decoded.collegeCode || decoded.collegeId;
      }
    } catch (e) {
      // ignore invalid tokens here; requireAuth handles rejection
    }
  }

  // 2. Custom tenant headers
  const headerCode = req.headers['x-tenant-code'] || req.headers['x-college-code'] || req.headers['x-tenant-id'];
  if (headerCode) return headerCode.trim();

  // 3. Subdomain extraction from Host (ignoring IP addresses like 127.0.0.1)
  const host = (req.headers.host || '').split(':')[0];
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  if (!isIpAddress) {
    const hostParts = host.split('.');
    if (hostParts.length > 2) {
      const sub = hostParts[0].toLowerCase();
      if (!['www', 'api', 'app', 'localhost', 'platform', 'admin'].includes(sub)) {
        return sub;
      }
    }
  }

  // 4. Query param or body
  if (req.query?.tenant) return req.query.tenant;
  if (req.query?.collegeCode) return req.query.collegeCode;
  if (req.body?.collegeCode) return req.body.collegeCode;

  // 5. Default fallback to Flagship institution
  return 'CAMPUS_MAIN';
}

/**
 * Middleware: Attach resolved tenant context to incoming request
 */
async function attachTenantContext(req, res, next) {
  try {
    const identifier = extractTenantIdentifier(req);
    const tenant = await resolveTenantMetadata(identifier);

    req.tenant = {
      collegeId: tenant.id,
      code: tenant.code,
      name: tenant.name,
      type: tenant.type,
      subdomain: tenant.subdomain,
      databaseName: tenant.database_name,
      getPool: () => getTenantPool(tenant.id),
      query: (sql, params) => queryTenant(tenant.id, sql, params),
    };

    tenantStorage.run(req, () => {
      next();
    });
  } catch (err) {
    console.warn(`[TENANT CONTEXT WARN]: Could not resolve tenant context: ${err.message}`);
    // Provide fallback tenant if resolution failed
    req.tenant = {
      collegeId: 1,
      code: 'CAMPUS_MAIN',
      name: 'CampusCorp Flagship Institution',
      type: 'AUTONOMOUS',
      subdomain: 'main',
      databaseName: process.env.DB_COMMON_NAME || 'lms',
      getPool: () => getTenantPool('CAMPUS_MAIN'),
      query: (sql, params) => queryTenant('CAMPUS_MAIN', sql, params),
    };
    tenantStorage.run(req, () => {
      next();
    });
  }
}

module.exports = {
  attachTenantContext,
  extractTenantIdentifier,
};
