const jwt = require('jsonwebtoken');
const { queryPlatform } = require('../config/platformDb');
const { isTokenRevoked } = require('../services/sessionRevocationService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_placement_jwt_secret_key_2026_production_grade';

/**
 * Middleware: Verify Platform Super Admin authentication
 */
async function requirePlatformAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.query?.platformToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Platform administrator credentials required.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired platform session token.',
      error: err.name,
    });
  }

  // Ensure this token belongs to the platform administration tier
  if (!decoded.isPlatformAdmin || !decoded.platformUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. This token does not have platform administrative privileges.',
    });
  }

  // Check if session has been revoked
  const revoked = await isTokenRevoked(token, { ...decoded, adminId: decoded.platformUserId, role: 'PLATFORM_SUPER_ADMIN' });
  if (revoked) {
    return res.status(401).json({
      success: false,
      message: 'Platform administrator session revoked. Please log in again.',
      code: 'SESSION_REVOKED',
    });
  }

  try {
    const users = await queryPlatform(
      'SELECT id, uuid, email, first_name, last_name, role, status FROM platform_users WHERE id = ?',
      [decoded.platformUserId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Platform administrator account not found.',
      });
    }

    const platformUser = users[0];
    if (platformUser.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Platform administrator account has been suspended.',
      });
    }

    req.platformUser = platformUser;
    next();
  } catch (err) {
    console.error('[PLATFORM AUTH ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error validating platform administrator token.',
      error: err.message,
    });
  }
}

module.exports = {
  requirePlatformAdmin,
  JWT_SECRET,
};

