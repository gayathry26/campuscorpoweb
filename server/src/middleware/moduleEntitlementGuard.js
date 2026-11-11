const { queryPlatform } = require('../config/platformDb');

const entitlementCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Check if a college has entitlement for a given module key
 * @param {number} collegeId
 * @param {string} moduleKey
 * @returns {Promise<boolean>}
 */
async function isModuleEnabledForCollege(collegeId, moduleKey) {
  const cacheKey = `${collegeId}_${moduleKey.toUpperCase()}`;
  const cached = entitlementCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.isEnabled;
  }

  const rows = await queryPlatform(
    'SELECT is_enabled FROM college_module_entitlements WHERE college_id = ? AND module_key = ?',
    [collegeId, moduleKey.toUpperCase()]
  );

  // If no specific row exists, check if module is globally active or fallback to true for flagship
  let isEnabled = true;
  if (rows.length > 0) {
    isEnabled = Boolean(rows[0].is_enabled);
  }

  entitlementCache.set(cacheKey, { isEnabled, expiresAt: Date.now() + CACHE_TTL_MS });
  return isEnabled;
}

/**
 * Middleware factory: Restrict endpoint to colleges entitled to the specified module
 * @param {string} moduleKey - e.g. 'LMS', 'CAREER_EXPLORER', 'ASSESSMENTS', 'INTERVIEWS'
 */
function requireModule(moduleKey) {
  return async (req, res, next) => {
    try {
      const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
      const isEnabled = await isModuleEnabledForCollege(collegeId, moduleKey);

      if (!isEnabled) {
        return res.status(403).json({
          success: false,
          message: `Access denied. The module '${moduleKey}' is not enabled for your institution (${req.tenant?.name || 'College'}).`,
          moduleKey,
          upgradeRequired: true,
        });
      }

      next();
    } catch (err) {
      console.error(`[MODULE GUARD ERROR for ${moduleKey}]:`, err);
      next();
    }
  };
}

/**
 * Invalidate cached module entitlements for a specific college or all colleges
 * @param {number|string} [collegeId]
 */
function invalidateEntitlementCache(collegeId) {
  if (!collegeId) {
    entitlementCache.clear();
    return;
  }
  const prefix = `${collegeId}_`;
  for (const key of entitlementCache.keys()) {
    if (key.startsWith(prefix)) {
      entitlementCache.delete(key);
    }
  }
}

module.exports = {
  requireModule,
  isModuleEnabledForCollege,
  invalidateEntitlementCache,
};

