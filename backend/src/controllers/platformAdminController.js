const platformService = require('../services/platformAdminService');
const provisioningService = require('../services/collegeProvisioningService');
const { revokeAllCollegeSessions } = require('../services/sessionRevocationService');

/**
 * Controller: Platform SaaS Overview Metrics
 */
async function getOverview(req, res) {
  try {
    const data = await platformService.getPlatformOverview();
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[PLATFORM GET OVERVIEW ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Colleges Directory
 */
async function getColleges(req, res) {
  try {
    const { search, status, type } = req.query;
    const colleges = await platformService.getColleges({ search, status, type });
    return res.json({ success: true, data: colleges });
  } catch (err) {
    console.error('[PLATFORM GET COLLEGES ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Single College Detail
 */
async function getCollegeById(req, res) {
  try {
    const { id } = req.params;
    const college = await platformService.getCollegeById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }
    return res.json({ success: true, data: college });
  } catch (err) {
    console.error('[PLATFORM GET COLLEGE BY ID ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update College Status (ACTIVE, SUSPENDED, ARCHIVED)
 */
async function updateCollegeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const result = await platformService.updateCollegeStatus(
      id,
      status,
      req.platformUser?.id,
      ipAddress
    );
    return res.json({ success: true, message: `College status updated to ${status}.`, data: result, newStatus: status });
  } catch (err) {
    console.error('[PLATFORM UPDATE STATUS ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Database Registry
 */
async function getDatabases(req, res) {
  try {
    const databases = await platformService.getDatabaseRegistry();
    return res.json({ success: true, data: databases });
  } catch (err) {
    console.error('[PLATFORM GET DATABASES ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Ping Database Registry Entry
 */
async function pingDatabase(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.pingCollegeDatabase(id, req.platformUser?.id, ipAddress);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[PLATFORM PING DB ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Platform Modules Catalog
 */
async function getModules(req, res) {
  try {
    const modules = await platformService.getPlatformModules();
    return res.json({ success: true, data: modules });
  } catch (err) {
    console.error('[PLATFORM GET MODULES ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update Module Entitlements for a College
 */
async function updateCollegeModules(req, res) {
  try {
    const { id } = req.params;
    const { modules } = req.body; // { LMS: true, CAREER_EXPLORER: false, ... }
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    if (!modules || typeof modules !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid module entitlements payload.' });
    }

    const result = await platformService.updateCollegeModules(id, modules, req.platformUser?.id, ipAddress);
    return res.json({ success: true, message: 'College module entitlements updated.', data: result });
  } catch (err) {
    console.error('[PLATFORM UPDATE MODULES ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Subscription Plans
 */
async function getSubscriptionPlans(req, res) {
  try {
    const plans = await platformService.getSubscriptionPlans();
    return res.json({ success: true, data: plans });
  } catch (err) {
    console.error('[PLATFORM GET PLANS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update / Assign Subscription for a College
 */
async function updateCollegeSubscription(req, res) {
  try {
    const { id } = req.params;
    const { planId, expiryDate, customStudentLimit, notes } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    if (!planId || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Plan ID and expiry date are required.' });
    }

    const result = await platformService.updateCollegeSubscription(
      id,
      { planId, expiryDate, customStudentLimit, notes },
      req.platformUser?.id,
      ipAddress
    );
    return res.json({ success: true, message: 'Subscription successfully assigned.', data: result });
  } catch (err) {
    console.error('[PLATFORM UPDATE SUB ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Audit Logs
 */
async function getAuditLogs(req, res) {
  try {
    const { page, limit, action, entityType } = req.query;
    const result = await platformService.getPlatformAuditLogs({ page, limit, action, entityType });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[PLATFORM GET AUDIT LOGS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get Global Platform Settings
 */
async function getSettings(req, res) {
  try {
    const settings = await platformService.getPlatformSettings();
    return res.json({ success: true, data: settings });
  } catch (err) {
    console.error('[PLATFORM GET SETTINGS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update Platform Settings
 */
async function updateSettings(req, res) {
  try {
    const { settings } = req.body; // [ { setting_key: 'platform_name', setting_value: 'CampusCorp' } ]
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Settings array required.' });
    }

    const result = await platformService.updatePlatformSettings(settings, req.platformUser?.id, ipAddress);
    return res.json({ success: true, message: 'Platform settings updated.', data: result });
  } catch (err) {
    console.error('[PLATFORM UPDATE SETTINGS ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Automated College Onboarding & Dedicated Database Provisioning
 */
async function provisionCollege(req, res) {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await provisioningService.provisionNewCollege(
      req.body,
      req.platformUser?.id,
      ipAddress
    );
    return res.status(201).json(result);
  } catch (err) {
    console.error('[PLATFORM PROVISION COLLEGE ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Purge Failed or Orphaned College Attempt
 */
async function purgeFailedCollege(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await provisioningService.cleanupFailedCollege(id, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    console.error('[PLATFORM PURGE FAILED COLLEGE ERROR]:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Force revoke all active sessions for a specific college (Emergency Killswitch)
 */
async function revokeCollegeSessions(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const ipAddress = req.ip || req.headers['x-forwarded-for'];

    const result = await revokeAllCollegeSessions(id, reason || 'Emergency session revocation by Platform Super Admin', req.platformUser?.email);

    await platformService.recordAuditLog({
      platformUserId: req.platformUser?.id,
      action: 'COLLEGE_SESSIONS_REVOKED',
      entityType: 'COLLEGE',
      entityId: id,
      details: { collegeId: id, reason },
      ipAddress,
    });

    return res.json({
      success: true,
      message: `All active sessions for college ID ${id} have been revoked.`,
      result,
    });
  } catch (err) {
    console.error('[PLATFORM REVOKE COLLEGE SESSIONS ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Create new subscription plan
 */
async function createPlan(req, res) {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.createSubscriptionPlan(req.body, req.platformUser?.id, ipAddress);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update subscription plan
 */
async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.updateSubscriptionPlan(id, req.body, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Delete subscription plan
 */
async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.deleteSubscriptionPlan(id, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get college invoices
 */
async function getInvoices(req, res) {
  try {
    const { id } = req.params;
    const invoices = await platformService.getCollegeInvoices(id);
    return res.json({ success: true, invoices });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Create college invoice
 */
async function createInvoice(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.createCollegeInvoice(id, req.body, req.platformUser?.id, ipAddress);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Check college student quota
 */
async function checkQuota(req, res) {
  try {
    const { id } = req.params;
    const quota = await platformService.checkStudentQuota(id);
    return res.json({ success: true, quota, data: quota });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get platform cluster telemetry
 */
async function getTelemetry(req, res) {
  try {
    const telemetry = await platformService.getClusterTelemetry();
    return res.json({ success: true, data: telemetry, telemetry });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Get storage usage per database
 */
async function getStorageUsage(req, res) {
  try {
    const storage = await platformService.getClusterStorageUsage();
    return res.json({ success: true, data: storage, storage });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Export audit logs to CSV
 */
async function exportAuditLogs(req, res) {
  try {
    const { action, entityType, startDate, endDate } = req.query;
    const csvContent = await platformService.exportAuditLogsToCsv({ action, entityType, startDate, endDate });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=platform_audit_logs_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update College Information
 */
async function updateCollege(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.updateCollegeDetails(id, req.body, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: List Platform Administrators
 */
async function getPlatformUsers(req, res) {
  try {
    const users = await platformService.getPlatformUsers();
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Create Platform Administrator
 */
async function createPlatformUser(req, res) {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const user = await platformService.createPlatformAdminUser(req.body, req.platformUser?.id, ipAddress);
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Update Platform Administrator Status
 */
async function updatePlatformUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.updatePlatformUserStatus(id, status, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Revoke Platform Administrator Sessions
 */
async function revokePlatformUserSessions(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.revokePlatformUserSessions(id, reason, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Aggregated College Administrators Directory
 */
async function getCollegeAdmins(req, res) {
  try {
    const { search, collegeId } = req.query;
    const directory = await platformService.getAllCollegeAdminsDirectory({ search, collegeId: collegeId ? parseInt(collegeId, 10) : null });
    return res.json({ success: true, data: directory });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Controller: Retry or Re-run College DB Provisioning
 */
async function retryProvision(req, res) {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    const result = await platformService.retryCollegeProvisioning(id, req.platformUser?.id, ipAddress);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = {
  getOverview,
  getColleges,
  getCollegeById,
  updateCollege,
  updateCollegeStatus,
  getDatabases,
  pingDatabase,
  retryProvision,
  getModules,
  updateCollegeModules,
  getSubscriptionPlans,
  createPlan,
  updatePlan,
  deletePlan,
  updateCollegeSubscription,
  getInvoices,
  createInvoice,
  checkQuota,
  getTelemetry,
  getStorageUsage,
  getAuditLogs,
  exportAuditLogs,
  getSettings,
  updateSettings,
  provisionCollege,
  purgeFailedCollege,
  revokeCollegeSessions,
  getPlatformUsers,
  createPlatformUser,
  updatePlatformUserStatus,
  revokePlatformUserSessions,
  getCollegeAdmins,
};

