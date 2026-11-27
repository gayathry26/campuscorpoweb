const express = require('express');
const router = express.Router();

const platformAuthController = require('../controllers/platformAuthController');
const platformAdminController = require('../controllers/platformAdminController');
const { requirePlatformAdmin } = require('../middleware/platformAuth');

// --- Platform Super Admin Authentication ---
router.post('/auth/login', platformAuthController.login);
router.post('/auth/logout', requirePlatformAdmin, platformAuthController.logout);
router.get('/auth/me', requirePlatformAdmin, platformAuthController.getMe);

// --- SaaS Overview Dashboard ---
router.get('/overview', requirePlatformAdmin, platformAdminController.getOverview);

// --- College Institution Registry & Automated Provisioning ---
router.get('/colleges', requirePlatformAdmin, platformAdminController.getColleges);
router.post('/colleges/provision', requirePlatformAdmin, platformAdminController.provisionCollege);
router.get('/colleges/:id', requirePlatformAdmin, platformAdminController.getCollegeById);
router.put('/colleges/:id', requirePlatformAdmin, platformAdminController.updateCollege);
router.patch('/colleges/:id/status', requirePlatformAdmin, platformAdminController.updateCollegeStatus);
router.post('/colleges/:id/revoke-sessions', requirePlatformAdmin, platformAdminController.revokeCollegeSessions);
router.delete('/colleges/:id/purge', requirePlatformAdmin, platformAdminController.purgeFailedCollege);

// --- User & Access Management (Platform & College Administrators) ---
router.get('/users/platform-admins', requirePlatformAdmin, platformAdminController.getPlatformUsers);
router.post('/users/platform-admins', requirePlatformAdmin, platformAdminController.createPlatformUser);
router.patch('/users/platform-admins/:id/status', requirePlatformAdmin, platformAdminController.updatePlatformUserStatus);
router.post('/users/platform-admins/:id/revoke-sessions', requirePlatformAdmin, platformAdminController.revokePlatformUserSessions);
router.get('/users/college-admins', requirePlatformAdmin, platformAdminController.getCollegeAdmins);

// --- College Invoicing & Quota ---
router.get('/colleges/:id/invoices', requirePlatformAdmin, platformAdminController.getInvoices);
router.post('/colleges/:id/invoices', requirePlatformAdmin, platformAdminController.createInvoice);
router.get('/colleges/:id/quota', requirePlatformAdmin, platformAdminController.checkQuota);

// --- College Module Entitlements ---
router.get('/modules', requirePlatformAdmin, platformAdminController.getModules);
router.put('/colleges/:id/modules', requirePlatformAdmin, platformAdminController.updateCollegeModules);

// --- College Subscriptions & Plans ---
router.get('/subscriptions/plans', requirePlatformAdmin, platformAdminController.getSubscriptionPlans);
router.post('/subscriptions/plans', requirePlatformAdmin, platformAdminController.createPlan);
router.put('/subscriptions/plans/:id', requirePlatformAdmin, platformAdminController.updatePlan);
router.delete('/subscriptions/plans/:id', requirePlatformAdmin, platformAdminController.deletePlan);
router.put('/colleges/:id/subscription', requirePlatformAdmin, platformAdminController.updateCollegeSubscription);

// --- Database Connection Registry & Cluster Monitoring ---
router.get('/databases', requirePlatformAdmin, platformAdminController.getDatabases);
router.post('/databases/:id/ping', requirePlatformAdmin, platformAdminController.pingDatabase);
router.post('/databases/:id/retry-provision', requirePlatformAdmin, platformAdminController.retryProvision);
router.get('/monitoring/telemetry', requirePlatformAdmin, platformAdminController.getTelemetry);
router.get('/telemetry', requirePlatformAdmin, platformAdminController.getTelemetry);
router.get('/monitoring/storage', requirePlatformAdmin, platformAdminController.getStorageUsage);
router.get('/storage', requirePlatformAdmin, platformAdminController.getStorageUsage);

// --- Platform Audit Logs & Compliance Export ---
router.get('/audit-logs', requirePlatformAdmin, platformAdminController.getAuditLogs);
router.get('/audit-logs/export', requirePlatformAdmin, platformAdminController.exportAuditLogs);

// --- Global Platform Settings ---
router.get('/settings', requirePlatformAdmin, platformAdminController.getSettings);
router.put('/settings', requirePlatformAdmin, platformAdminController.updateSettings);

module.exports = router;

