const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryPlatform } = require('../config/platformDb');
const { JWT_SECRET } = require('../middleware/platformAuth');
const { recordAuditLog } = require('../services/platformAdminService');
const { revokeToken } = require('../services/sessionRevocationService');

/**
 * Platform Super Admin Login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const rows = await queryPlatform(
      'SELECT id, uuid, email, password_hash, first_name, last_name, role, status FROM platform_users WHERE LOWER(email) = ?',
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid platform administrator credentials.',
      });
    }

    const user = rows[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your platform administrator account is currently suspended.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Record failed attempt in audit log
      await recordAuditLog({
        platformUserId: user.id,
        action: 'PLATFORM_LOGIN_FAILED',
        entityType: 'PLATFORM_USER',
        entityId: user.id,
        details: { email: cleanEmail, reason: 'Invalid password' },
        ipAddress,
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid platform administrator credentials.',
      });
    }

    // Generate Platform-Scoped Token
    const token = jwt.sign(
      {
        jti: crypto.randomUUID(),
        platformUserId: user.id,
        uuid: user.uuid,
        email: user.email,
        role: user.role,
        isPlatformAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Record successful login audit log
    await recordAuditLog({
      platformUserId: user.id,
      action: 'PLATFORM_LOGIN_SUCCESS',
      entityType: 'PLATFORM_USER',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress,
    });

    return res.json({
      success: true,
      message: 'Platform administrator authenticated successfully.',
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[PLATFORM LOGIN ERROR]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing platform authentication.',
      error: err.message,
    });
  }
}

/**
 * Verify current platform administrator session
 */
async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.platformUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching platform user profile.',
      error: err.message,
    });
  }
}

/**
 * Log out platform administrator and revoke session token
 */
async function logout(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.query?.platformToken;

    if (token) {
      await revokeToken({
        token,
        tokenType: 'PLATFORM',
        userId: req.platformUser?.id,
        reason: 'Platform administrator logged out',
        revokedBy: req.platformUser?.email || 'SELF',
      });
    }

    return res.json({
      success: true,
      message: 'Platform administrator logged out successfully. Session revoked.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  login,
  getMe,
  logout,
};

