const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { queryPlatform } = require('../config/platformDb');
const { queryTenant } = require('../config/tenantConnectionManager');

// In-memory blacklist cache: tokenHash -> expiresAtMs
const revokedTokenCache = new Map();

// In-memory timestamp killswitches:
// collegeId -> timestampMs
const collegeRevocationTimestamps = new Map();

// "collegeId:userId" -> timestampMs
const userRevocationTimestamps = new Map();

// "platform:adminId" -> timestampMs
const platformAdminRevocationTimestamps = new Map();

/**
 * Generate SHA-256 hash of a JWT string
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Initialize cache by loading active revoked tokens from database on startup
 */
async function initRevocationCache() {
  try {
    const rows = await queryPlatform(`
      SELECT token_hash, UNIX_TIMESTAMP(expires_at) * 1000 AS expires_at_ms
      FROM platform_revoked_tokens
      WHERE expires_at > NOW()
    `);

    for (const r of rows) {
      revokedTokenCache.set(r.token_hash, r.expires_at_ms);
    }

    const colleges = await queryPlatform(`
      SELECT id, UNIX_TIMESTAMP(sessions_revoked_before) * 1000 AS revoked_ms
      FROM colleges
      WHERE sessions_revoked_before IS NOT NULL
    `);
    for (const c of colleges) {
      if (c.revoked_ms) {
        collegeRevocationTimestamps.set(c.id, c.revoked_ms);
      }
    }
  } catch (err) {
    // Platform DB may be initializing
  }
}

// Clean up expired items every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [hash, exp] of revokedTokenCache.entries()) {
    if (exp < now) {
      revokedTokenCache.delete(hash);
    }
  }
}, 10 * 60 * 1000).unref();

// Run initial cache load
initRevocationCache();

/**
 * Check if a token has been revoked
 * @param {string} token
 * @param {object} decoded - { iat, exp, userId, collegeId }
 * @returns {Promise<boolean>}
 */
async function isTokenRevoked(token, decoded) {
  if (!token) return true;
  const tokenHash = hashToken(token);

  // 1. Direct token blacklist lookup (O(1))
  if (revokedTokenCache.has(tokenHash)) {
    const exp = revokedTokenCache.get(tokenHash);
    if (exp > Date.now()) {
      return true;
    }
    revokedTokenCache.delete(tokenHash);
  }

  const tokenIatMs = (decoded?.iat || 0) * 1000;

  // 2. Check College-Level Emergency Killswitch
  if (decoded?.collegeId) {
    let collegeRevokeMs = collegeRevocationTimestamps.get(decoded.collegeId);
    if (collegeRevokeMs === undefined) {
      // Lookup from Platform DB and cache
      try {
        const rows = await queryPlatform(
          'SELECT UNIX_TIMESTAMP(sessions_revoked_before) * 1000 AS ms FROM colleges WHERE id = ?',
          [decoded.collegeId]
        );
        collegeRevokeMs = rows[0]?.ms || null;
        collegeRevocationTimestamps.set(decoded.collegeId, collegeRevokeMs);
      } catch (e) {
        collegeRevokeMs = null;
      }
    }

    if (collegeRevokeMs && tokenIatMs < collegeRevokeMs) {
      return true;
    }
  }

  // 3. Check User-Level Killswitch
  if (decoded?.userId && decoded?.collegeId) {
    const userKey = `${decoded.collegeId}:${decoded.userId}`;
    let userRevokeMs = userRevocationTimestamps.get(userKey);

    if (userRevokeMs === undefined) {
      try {
        const rows = await queryTenant(
          decoded.collegeId,
          'SELECT UNIX_TIMESTAMP(sessions_revoked_before) * 1000 AS ms FROM users WHERE id = ?',
          [decoded.userId]
        );
        userRevokeMs = rows[0]?.ms || null;
        userRevocationTimestamps.set(userKey, userRevokeMs);
      } catch (e) {
        userRevokeMs = null;
      }
    }

    if (userRevokeMs && tokenIatMs < userRevokeMs) {
      return true;
    }
  }

  // 4. Check Platform Admin Killswitch
  if (decoded?.role === 'PLATFORM_SUPER_ADMIN' && decoded?.adminId) {
    const adminKey = `platform:${decoded.adminId}`;
    let adminRevokeMs = platformAdminRevocationTimestamps.get(adminKey);

    if (adminRevokeMs === undefined) {
      try {
        const rows = await queryPlatform(
          'SELECT UNIX_TIMESTAMP(sessions_revoked_before) * 1000 AS ms FROM platform_users WHERE id = ?',
          [decoded.adminId]
        );
        adminRevokeMs = rows[0]?.ms || null;
        platformAdminRevocationTimestamps.set(adminKey, adminRevokeMs);
      } catch (e) {
        adminRevokeMs = null;
      }
    }

    if (adminRevokeMs && tokenIatMs < adminRevokeMs) {
      return true;
    }
  }

  return false;
}

/**
 * Revoke an individual active token (Self-logout)
 */
async function revokeToken({ token, tokenType = 'COLLEGE', userId = null, collegeId = null, reason = 'User logged out', revokedBy = null }) {
  if (!token) return false;
  const tokenHash = hashToken(token);

  let decoded;
  try {
    decoded = jwt.decode(token);
  } catch (e) {
    return false;
  }

  const expSec = decoded?.exp || Math.floor(Date.now() / 1000) + 86400;
  const expDate = new Date(expSec * 1000);
  const expMs = expSec * 1000;

  // Add to in-memory blacklist immediately
  revokedTokenCache.set(tokenHash, expMs);

  // Persist to central platform_revoked_tokens
  try {
    await queryPlatform(`
      INSERT INTO platform_revoked_tokens 
        (token_hash, token_type, user_id, college_id, reason, revoked_by, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)
    `, [
      tokenHash,
      tokenType,
      userId || decoded?.userId || null,
      collegeId || decoded?.collegeId || null,
      reason,
      revokedBy || 'SELF',
      expDate,
    ]);
    return true;
  } catch (err) {
    console.warn(`[REVOCATION] Error recording revoked token: ${err.message}`);
    return true; // Still blacklisted in-memory
  }
}

/**
 * Emergency Killswitch: Revoke all active sessions for a specific college
 */
async function revokeAllCollegeSessions(collegeId, reason = 'Institutional sessions revoked by administrator', revokedBy = 'PLATFORM_SUPER_ADMIN') {
  const nowMs = Date.now();
  collegeRevocationTimestamps.set(parseInt(collegeId, 10), nowMs);

  await queryPlatform(`
    UPDATE colleges
    SET sessions_revoked_before = NOW()
    WHERE id = ?
  `, [collegeId]);

  return { success: true, collegeId, revokedAt: new Date(nowMs).toISOString(), reason };
}

/**
 * Revoke all active sessions for a specific user
 */
async function revokeAllUserSessions(collegeId, userId, reason = 'User sessions revoked by administrator', revokedBy = 'COLLEGE_ADMIN') {
  const nowMs = Date.now();
  const userKey = `${collegeId}:${userId}`;
  userRevocationTimestamps.set(userKey, nowMs);

  await queryTenant(
    collegeId,
    `UPDATE users SET sessions_revoked_before = NOW() WHERE id = ?`,
    [userId]
  );

  return { success: true, collegeId, userId, revokedAt: new Date(nowMs).toISOString(), reason };
}

/**
 * Revoke all active sessions for a platform admin
 */
async function revokeAllPlatformAdminSessions(adminId, reason = 'Platform admin sessions revoked') {
  const nowMs = Date.now();
  const adminKey = `platform:${adminId}`;
  platformAdminRevocationTimestamps.set(adminKey, nowMs);

  await queryPlatform(`
    UPDATE platform_users
    SET sessions_revoked_before = NOW()
    WHERE id = ?
  `, [adminId]);

  return { success: true, adminId, revokedAt: new Date(nowMs).toISOString(), reason };
}

module.exports = {
  hashToken,
  isTokenRevoked,
  revokeToken,
  revokeAllCollegeSessions,
  revokeAllUserSessions,
  revokeAllPlatformAdminSessions,
};
