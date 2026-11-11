const { queryTenant, resolveTenantMetadata } = require('../config/tenantConnectionManager');
const { isModuleEnabledForCollege } = require('../middleware/moduleEntitlementGuard');
const { revokeAllUserSessions } = require('../services/sessionRevocationService');

/**
 * Controller: Get Institutional Profile for the logged-in College Admin
 */
async function getCollegeProfile(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const metadata = await resolveTenantMetadata(collegeId);

    return res.json({
      success: true,
      college: {
        id: metadata.id,
        code: metadata.code,
        name: metadata.name,
        type: metadata.type,
        subdomain: metadata.subdomain,
        contactEmail: metadata.contact_email,
        databaseName: metadata.database_name,
        status: metadata.status,
      },
    });
  } catch (err) {
    console.error('[COLLEGE ADMIN GET PROFILE ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Institutional Dashboard Metrics strictly isolated to this college
 */
async function getCollegeMetrics(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const metadata = await resolveTenantMetadata(collegeId);

    // Execute queries against this college's dedicated database
    const studentRows = await queryTenant(collegeId, `SELECT COUNT(*) AS total FROM students_master`).catch(() => [{ total: 0 }]);
    const userRows = await queryTenant(collegeId, `SELECT COUNT(*) AS total FROM users`).catch(() => [{ total: 0 }]);
    const companyRows = await queryTenant(collegeId, `SELECT COUNT(*) AS total FROM companies`).catch(() => [{ total: 0 }]);
    const jobRows = await queryTenant(collegeId, `SELECT COUNT(*) AS total FROM jobs WHERE status = 'PUBLISHED'`).catch(() => [{ total: 0 }]);
    const driveRows = await queryTenant(collegeId, `SELECT COUNT(*) AS total FROM placement_drives WHERE status = 'UPCOMING' OR status = 'IN_PROGRESS'`).catch(() => [{ total: 0 }]);
    const deptRows = await queryTenant(collegeId, `SELECT dept_code, dept_name FROM departments WHERE is_active = 1`).catch(() => []);

    return res.json({
      success: true,
      data: {
        collegeCode: metadata.code,
        collegeName: metadata.name,
        databaseName: metadata.database_name,
        metrics: {
          totalStudents: Number(studentRows[0]?.total || 0),
          totalUsers: Number(userRows[0]?.total || 0),
          totalCompanies: Number(companyRows[0]?.total || 0),
          activeJobs: Number(jobRows[0]?.total || 0),
          activeDrives: Number(driveRows[0]?.total || 0),
          departmentsCount: Array.isArray(deptRows) ? deptRows.length : 0,
        },
        departments: deptRows || [],
      },
    });
  } catch (err) {
    console.error('[COLLEGE ADMIN GET METRICS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Departments for the active College
 */
async function getDepartments(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const depts = await queryTenant(
      collegeId,
      'SELECT id, dept_code, dept_name, hod_name, is_active, created_at FROM departments ORDER BY dept_code ASC'
    );
    return res.json({ success: true, data: depts });
  } catch (err) {
    console.error('[COLLEGE ADMIN GET DEPTS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Create new Department in this college's database
 */
async function createDepartment(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const { dept_code, dept_name, hod_name } = req.body;

    if (!dept_code || !dept_name) {
      return res.status(400).json({ success: false, message: 'Department code and name are required.' });
    }

    const cleanCode = dept_code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');

    await queryTenant(
      collegeId,
      'INSERT INTO departments (dept_code, dept_name, hod_name) VALUES (?, ?, ?)',
      [cleanCode, dept_name.trim(), hod_name ? hod_name.trim() : null]
    );

    return res.status(201).json({
      success: true,
      message: `Department '${cleanCode}' created successfully.`,
      department: { dept_code: cleanCode, dept_name: dept_name.trim(), hod_name },
    });
  } catch (err) {
    console.error('[COLLEGE ADMIN CREATE DEPT ERROR]:', err);
    if (err.message.includes('Duplicate entry')) {
      return res.status(400).json({ success: false, message: `Department code '${req.body?.dept_code}' already exists.` });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Institutional Settings
 */
async function getCollegeSettings(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const settings = await queryTenant(
      collegeId,
      'SELECT id, setting_key, setting_value, description FROM college_settings ORDER BY setting_key ASC'
    );
    return res.json({ success: true, data: settings });
  } catch (err) {
    console.error('[COLLEGE ADMIN GET SETTINGS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update Institutional Settings
 */
async function updateCollegeSettings(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings array required.' });
    }

    for (const s of settings) {
      await queryTenant(
        collegeId,
        'UPDATE college_settings SET setting_value = ? WHERE setting_key = ?',
        [String(s.setting_value), s.setting_key]
      );
    }

    return res.json({ success: true, message: 'Institutional settings updated successfully.' });
  } catch (err) {
    console.error('[COLLEGE ADMIN UPDATE SETTINGS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Force revoke all active sessions for a specific user within this college
 */
async function revokeUserSessions(req, res) {
  try {
    const collegeId = req.user?.collegeId || req.tenant?.collegeId || 1;
    const { userId } = req.params;
    const { reason } = req.body || {};

    const result = await revokeAllUserSessions(collegeId, userId, reason || 'Revoked by College Administrator', req.user.email);

    return res.json({
      success: true,
      message: `Active sessions for user ID ${userId} have been successfully revoked.`,
      result,
    });
  } catch (err) {
    console.error('[COLLEGE ADMIN REVOKE USER SESSIONS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getCollegeProfile,
  getCollegeMetrics,
  getDepartments,
  createDepartment,
  getCollegeSettings,
  updateCollegeSettings,
  revokeUserSessions,
};
