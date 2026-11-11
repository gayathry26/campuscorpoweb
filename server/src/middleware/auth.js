const jwt = require('jsonwebtoken');
const { queryCommon } = require('../config/db');
const { queryTenant, resolveTenantMetadata } = require('../config/tenantConnectionManager');
const { isTokenRevoked } = require('../services/sessionRevocationService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_placement_jwt_secret_key_2026_production_grade';

/**
 * Authenticate JWT token and attach user info
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.query?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid, expired, or malformed authentication token.',
      error: err.name,
    });
  }

  // Check if session has been revoked
  const revoked = await isTokenRevoked(token, decoded);
  if (revoked) {
    return res.status(401).json({
      success: false,
      message: 'Session revoked. Please log in again.',
      code: 'SESSION_REVOKED',
    });
  }

  try {
    const userQuerySql = `
      SELECT u.id, u.uuid, u.email, u.role_id, u.role_name, u.first_name, u.last_name, 
             COALESCE(sm.department_code, u.department_code) AS department_code, u.status,
             sm.id AS student_id, sm.register_number, sm.cgpa, sm.placement_status,
             sm.batch, sm.graduation_year, COALESCE(sm.academic_year, '2026-2027') AS academic_year
      FROM users u
      LEFT JOIN students_master sm ON sm.user_id = u.id
      WHERE u.id = ? AND u.status = 'ACTIVE'
    `;

    // Query either tenant-dedicated database or default common database
    let users = [];
    if (decoded.collegeId) {
      users = await queryTenant(decoded.collegeId, userQuerySql, [decoded.userId]);
    } else {
      users = await queryCommon(userQuerySql, [decoded.userId]);
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or inactive account.',
      });
    }

    const activeCollegeId = decoded.collegeId || 1;
    let resolvedDbName = decoded.dbName;
    if (!resolvedDbName && decoded.collegeId) {
      try {
        const meta = await resolveTenantMetadata(decoded.collegeId);
        resolvedDbName = meta?.database_name;
      } catch (e) {}
    }
    if (!resolvedDbName) resolvedDbName = process.env.DB_COMMON_NAME || 'lms';

    req.user = users[0];
    req.user.collegeId = activeCollegeId;
    req.user.collegeCode = decoded.collegeCode || 'CAMPUS_MAIN';
    req.tenant = {
      collegeId: activeCollegeId,
      code: decoded.collegeCode || 'CAMPUS_MAIN',
      databaseName: resolvedDbName,
      query: (sql, params) => queryTenant(activeCollegeId, sql, params),
    };
    next();
  } catch (dbErr) {
    if (dbErr.code === 'ECONNREFUSED' || dbErr.message?.includes('ECONNREFUSED')) {
      req.user = {
        id: decoded.userId || 1,
        uuid: decoded.uuid || '00000000-0000-0000-0000-000000000001',
        email: decoded.email || 'student.cse1@college.edu',
        role_id: decoded.roleId || 3,
        role_name: decoded.roleName || 'STUDENT',
        first_name: decoded.firstName || 'Aditya',
        last_name: decoded.lastName || 'Varma',
        department_code: decoded.departmentCode || 'CSE',
        status: 'ACTIVE',
        student_id: decoded.studentId || 1,
        register_number: decoded.registerNumber || '2023CSE001',
        cgpa: decoded.cgpa || '9.35',
        placement_status: decoded.placementStatus || 'PLACED',
        batch: decoded.batch || '2023-2027',
        graduation_year: decoded.graduationYear || 2027,
        academic_year: decoded.academicYear || '2026-2027',
      };
      return next();
    }
  }
}

/**
 * Optional JWT authentication: if token is absent or demo student, attaches default active student context
 */
async function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = {
      id: 1,
      student_id: 1,
      first_name: 'Aditya',
      last_name: 'Varma',
      role_name: 'STUDENT',
      department_code: 'CSE',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await queryCommon(
      `SELECT u.id, u.uuid, u.email, u.role_id, u.role_name, u.first_name, u.last_name, 
              COALESCE(sm.department_code, u.department_code) AS department_code, u.status,
              sm.id AS student_id, sm.register_number, sm.cgpa, sm.placement_status,
              sm.batch, sm.graduation_year, COALESCE(sm.academic_year, '2026-2027') AS academic_year
       FROM users u
       LEFT JOIN students_master sm ON sm.user_id = u.id
       WHERE u.id = ? AND u.status = 'ACTIVE'`,
      [decoded.userId]
    );

    if (users.length > 0) {
      req.user = users[0];
    } else {
      req.user = {
        id: decoded.userId || 1,
        student_id: decoded.studentId || 1,
        role_name: decoded.roleName || 'STUDENT',
      };
    }
    return next();
  } catch (err) {
    req.user = {
      id: 1,
      student_id: 1,
      first_name: 'Aditya',
      last_name: 'Varma',
      role_name: 'STUDENT',
      department_code: 'CSE',
    };
    return next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  JWT_SECRET,
};
