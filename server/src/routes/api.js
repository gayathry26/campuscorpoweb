const express = require('express');
const router = express.Router();

const { authenticateToken, optionalAuthenticateToken } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { enforceDepartmentIsolation } = require('../middleware/deptIsolation');
const { requireModule } = require('../middleware/moduleEntitlementGuard');

// Controllers
const authCtrl = require('../controllers/authController');
const dashCtrl = require('../controllers/dashboardController');
const studentCtrl = require('../controllers/studentController');
const compCtrl = require('../controllers/companyController');
const jobCtrl = require('../controllers/jobController');
const driveCtrl = require('../controllers/driveController');
const appCtrl = require('../controllers/applicationController');
const intCtrl = require('../controllers/interviewController');
const mockIntCtrl = require('../controllers/mockInterviewController');
const videocallCtrl = require('../controllers/videocall');
const assessCtrl = require('../controllers/assessmentController');
const trainCtrl = require('../controllers/trainingController');
const internCtrl = require('../controllers/internshipController');
const offerCtrl = require('../controllers/offerController');
const policyCtrl = require('../controllers/policyController');
const notifCtrl = require('../controllers/notificationController');
const alumniCtrl = require('../controllers/alumniController');
const grievCtrl = require('../controllers/grievanceController');
const finCtrl = require('../controllers/financeController');
const reportCtrl = require('../controllers/reportController');
const adminCtrl = require('../controllers/adminController');
const aiCtrl = require('../controllers/aiController');
const rolePermCtrl = require('../controllers/rolePermissionController');
const userPrefCtrl = require('../controllers/userPreferencesController');
const skillAnalyzerCtrl = require('../controllers/skillAnalyzerController');
const careerExplorerCtrl = require('../controllers/careerExplorerController');
const lmsCtrl = require('../controllers/lmsController');
const deptAdminCtrl = require('../controllers/departmentAdminController');
const companyLocationCtrl = require('../controllers/companyLocationController');
const githubScanCtrl = require('../controllers/githubScannerController');
const collegeAdminCtrl = require('../controllers/collegeAdminController');
const { handleMaterialUpload, handleAssignmentUpload } = require('../middleware/lmsUpload.middleware');
const { handlePolicyUpload } = require('../middleware/policyUpload.middleware');
const { handleImportUpload } = require('../middleware/importUpload.middleware');
const resumeAnalyzerRoutes = require('./resumeAnalyzer.routes');

// 1. Authentication & Role Switcher
router.get('/auth/college-info', authCtrl.getPublicCollegeInfo);
router.get('/auth/colleges/directory', authCtrl.getPublicCollegesDirectory);
router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authenticateToken, authCtrl.logout);
router.get('/auth/me', authenticateToken, authCtrl.getCurrentUser);
router.post('/auth/switch-role', authCtrl.quickSwitchDemoRole);

// 1a. College Administrator Multi-Tenant Profile & Metrics
router.get('/college-admin/profile', authenticateToken, collegeAdminCtrl.getCollegeProfile);
router.get('/college-admin/metrics', authenticateToken, collegeAdminCtrl.getCollegeMetrics);
router.get('/college-admin/departments', authenticateToken, collegeAdminCtrl.getDepartments);
router.post('/college-admin/departments', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), collegeAdminCtrl.createDepartment);
router.get('/college-admin/settings', authenticateToken, collegeAdminCtrl.getCollegeSettings);
router.put('/college-admin/settings', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), collegeAdminCtrl.updateCollegeSettings);
router.post('/college-admin/users/:userId/revoke-sessions', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), collegeAdminCtrl.revokeUserSessions);

// 1b. Role Permissions & Dynamic Page Governance (Backend Persistence)
router.get('/permissions', rolePermCtrl.getRolePermissions);
router.get('/permissions/me', authenticateToken, rolePermCtrl.getCurrentUserPermissions);
router.put('/permissions', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), rolePermCtrl.updateRolePermissions);
router.post('/permissions/reset', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), rolePermCtrl.resetRolePermissions);

// 1c. User Settings & Preferences (Appearance & Notifications)
router.get('/users/preferences', authenticateToken, userPrefCtrl.getUserPreferences);
router.put('/users/preferences', authenticateToken, userPrefCtrl.updateUserPreferences);

// 2. Dashboards (Live Metrics)
router.get('/dashboard/metrics', authenticateToken, dashCtrl.getDashboardMetrics);

// 3. Students
router.get('/students', authenticateToken, studentCtrl.getAllStudents);
router.get('/students/:id', authenticateToken, studentCtrl.getStudentById);
router.put('/students/:id/profile', authenticateToken, studentCtrl.updateStudentProfile);
router.post('/students/sync-erp', authenticateToken, studentCtrl.syncFromErp);

// 4. Companies & Placement Drives (Module: RECRUITMENT)
router.use('/companies', requireModule('RECRUITMENT'));
router.use('/jobs', requireModule('RECRUITMENT'));
router.use('/drives', requireModule('RECRUITMENT'));
router.use('/applications', requireModule('RECRUITMENT'));
router.get('/companies', authenticateToken, compCtrl.getAllCompanies);
router.get('/companies/meta/departments', authenticateToken, compCtrl.getMetadata);
router.get('/companies/:id', authenticateToken, compCtrl.getCompanyById);
router.post('/companies', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.createCompany);
router.put('/companies/:id', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.updateCompany);
router.delete('/companies/:id', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.deleteCompany);
router.post('/companies/:id/apply', authenticateToken, compCtrl.applyCompanyDrive);
router.post('/companies/:id/withdraw', authenticateToken, compCtrl.withdrawCompanyApplication);

// 4b. Company Applicants, Announcements & Rounds Management
router.get('/companies/:id/applicants', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR']), compCtrl.getCompanyApplicants);
router.put('/companies/:id/applicants/:applicationId', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.updateCompanyApplicant);
router.post('/companies/:id/applicants/bulk-update', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.bulkUpdateCompanyApplicants);
router.get('/companies/:id/announcements', authenticateToken, compCtrl.getCompanyAnnouncements);
router.post('/companies/:id/announcements', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.createCompanyAnnouncement);
router.put('/companies/:id/rounds/:roundId', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), compCtrl.updateDriveRound);

// 5. Jobs & Opportunities
router.get('/jobs', authenticateToken, jobCtrl.getAllJobs);
router.get('/jobs/:id', authenticateToken, jobCtrl.getJobById);
router.post('/jobs', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'RECRUITER']), jobCtrl.createJob);
router.put('/jobs/:id/status', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN']), jobCtrl.updateJobStatus);

// 6. Placement Drives & Rounds
router.get('/drives', authenticateToken, driveCtrl.getAllDrives);
router.post('/drives', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN']), driveCtrl.createDrive);
router.put('/drives/:id/stage', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'RECRUITER']), driveCtrl.updateDriveStage);

// 7. Applications
router.get('/applications', authenticateToken, appCtrl.getApplications);
router.get('/applications/my-applications', authenticateToken, appCtrl.getMyApplications);
router.get('/applications/my', authenticateToken, appCtrl.getMyApplications);
router.post('/applications/apply', authenticateToken, appCtrl.applyToJob);
router.post('/applications/:id/withdraw', authenticateToken, appCtrl.withdrawApplication);
router.put('/applications/:id/status', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'RECRUITER', 'FACULTY_COORDINATOR']), appCtrl.updateApplicationStatus);

// 8. Interviews (Module: ASSESSMENTS)
router.use('/interviews', requireModule('ASSESSMENTS'));
router.use('/mock-interviews', requireModule('ASSESSMENTS'));
router.use('/videocall', requireModule('ASSESSMENTS'));
router.get('/interviews', authenticateToken, intCtrl.getInterviews);
router.post('/interviews/schedule', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'RECRUITER']), intCtrl.scheduleInterview);
router.put('/interviews/:id/feedback', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'RECRUITER']), intCtrl.submitInterviewFeedback);

// 8b. Mock Video Call Interviews (WebRTC Meet System)
router.get('/mock-interviews/ice-servers', authenticateToken, videocallCtrl.getIceServers);
router.get('/mock-interviews', authenticateToken, videocallCtrl.getMeetings);
router.get('/mock-interviews/:roomCode', authenticateToken, videocallCtrl.getMeetingByCode);
router.post('/mock-interviews', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF', 'RECRUITER']), videocallCtrl.createMeeting);
router.put('/mock-interviews/:id/status', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF', 'RECRUITER']), videocallCtrl.updateMeetingStatus);
router.put('/mock-interviews/:id/evaluate', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF', 'RECRUITER']), videocallCtrl.evaluateMeeting);
router.delete('/mock-interviews/:id', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF']), videocallCtrl.deleteMeeting);

// 8c. Dedicated WebRTC Video Call Endpoints
router.get('/videocall/ice-servers', authenticateToken, videocallCtrl.getIceServers);
router.get('/videocall/meetings', authenticateToken, videocallCtrl.getMeetings);
router.get('/videocall/meetings/:roomCode', authenticateToken, videocallCtrl.getMeetingByCode);
router.post('/videocall/meetings', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF', 'RECRUITER']), videocallCtrl.createMeeting);
router.put('/videocall/meetings/:id/status', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF', 'RECRUITER']), videocallCtrl.updateMeetingStatus);
router.put('/videocall/meetings/:id/evaluate', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF', 'RECRUITER']), videocallCtrl.evaluateMeeting);
router.delete('/videocall/meetings/:id', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'FACULTY_COORDINATOR', 'STAFF']), videocallCtrl.deleteMeeting);

// 9. Assessment & Coding Execution Platform (Module: ASSESSMENTS)
router.use('/assessment', requireModule('ASSESSMENTS'));
router.use('/student/compiler', requireModule('ASSESSMENTS'));
router.use('/compiler', requireModule('ASSESSMENTS'));
router.use('/student/quiz', requireModule('ASSESSMENTS'));
router.get('/assessment/runtime-status', assessCtrl.getRuntimeStatus);
router.get('/assessment/download-lock-exe', assessCtrl.downloadLockExe);
router.post('/assessment/launch-desktop-exe', optionalAuthenticateToken, assessCtrl.launchDesktopExe);
router.post('/assessment/run', optionalAuthenticateToken, assessCtrl.runCodeSandbox);
router.post('/student/compiler/run', optionalAuthenticateToken, assessCtrl.runCodeSandbox);
router.post('/compiler/run', optionalAuthenticateToken, assessCtrl.runCodeSandbox);
router.get('/assessment/list', optionalAuthenticateToken, assessCtrl.getAllAssessments);
router.get('/assessment/:id', optionalAuthenticateToken, assessCtrl.getAssessmentById);
router.post('/assessment/submit', authenticateToken, assessCtrl.submitCodeSolution);
router.get('/assessment/:id/leaderboard', authenticateToken, assessCtrl.getAssessmentLeaderboard);
router.post('/assessment/create', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'TPO_OFFICER']), assessCtrl.createCodingAssessment);
router.get('/assessment/:id/submissions', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'TPO_OFFICER']), assessCtrl.getAssessmentSubmissions);
router.get('/assessment/student/my-submissions', authenticateToken, assessCtrl.getStudentAssessmentsSummary);

// 9b. Online Quiz & CodeSprint Examination Routes
router.get('/student/quiz/subjects', assessCtrl.getQuizSubjects);
router.post('/student/quiz/attempts/start', assessCtrl.startQuizAttempt);
router.post('/student/quiz/attempts/save', assessCtrl.saveQuizAttempt);
router.post('/student/quiz/attempts/submit', assessCtrl.submitQuizAttempt);
router.post('/student/quiz/attempts/proctor-log', assessCtrl.saveProctorLog);

// 10. Training Programs & Department Attendance
router.get('/training', authenticateToken, trainCtrl.getAllTrainings);
router.post('/training', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN']), trainCtrl.createTraining);
router.get('/training/department/:departmentCode', authenticateToken, enforceDepartmentIsolation, trainCtrl.getDeptTrainingAttendance);
router.post('/training/record-attendance', authenticateToken, authorize(['FACULTY_COORDINATOR', 'ADMIN', 'TPO_OFFICER']), trainCtrl.recordDeptAttendance);

// 11. Internships
router.get('/internships', authenticateToken, internCtrl.getInternships);
router.post('/internships', authenticateToken, internCtrl.createInternship);

// 12. Offers (Module: RECRUITMENT)
router.use('/offers', requireModule('RECRUITMENT'));
router.get('/offers', authenticateToken, offerCtrl.getAllOffers);
router.post('/offers/issue', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'RECRUITER']), offerCtrl.issueOffer);
router.post('/offers/:id/respond', authenticateToken, offerCtrl.respondToOffer);

// 13. Policy Engine & Document Management System (Module: GOVERNANCE)
router.use('/policies', requireModule('GOVERNANCE'));
router.use('/reports', requireModule('GOVERNANCE'));
router.use('/finance', requireModule('GOVERNANCE'));
router.use('/grievances', requireModule('GOVERNANCE'));
router.get('/policies', authenticateToken, policyCtrl.getPolicies);
router.get('/policies/:id', authenticateToken, policyCtrl.getPolicyById);
router.post('/policies', authenticateToken, authorize(['FACULTY_COORDINATOR', 'TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), handlePolicyUpload, policyCtrl.createPolicy);
router.put('/policies/:id', authenticateToken, authorize(['FACULTY_COORDINATOR', 'TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), policyCtrl.updatePolicy);
router.post('/policies/:id/replace-file', authenticateToken, authorize(['FACULTY_COORDINATOR', 'TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), handlePolicyUpload, policyCtrl.replacePolicyFile);
router.patch('/policies/:id/status', authenticateToken, authorize(['FACULTY_COORDINATOR', 'TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), policyCtrl.changePolicyStatus);
router.delete('/policies/:id', authenticateToken, authorize(['FACULTY_COORDINATOR', 'TPO_OFFICER', 'ADMIN', 'SUPER_ADMIN']), policyCtrl.deletePolicy);
router.get('/policies/:id/preview', authenticateToken, policyCtrl.previewPolicyFile);
router.get('/policies/:id/download', authenticateToken, policyCtrl.downloadPolicyFile);
router.get('/policies/overrides/:departmentCode', authenticateToken, enforceDepartmentIsolation, policyCtrl.getDeptOverrides);
router.post('/policies/grant-override', authenticateToken, authorize(['FACULTY_COORDINATOR', 'ADMIN', 'TPO_OFFICER']), policyCtrl.grantCoordinatorOverride);

// 14. Notifications
router.get('/notifications', authenticateToken, notifCtrl.getNotifications);
router.post('/notifications/broadcast', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'MANAGEMENT', 'FACULTY_COORDINATOR']), notifCtrl.createNotification);

// 15. Alumni
router.get('/alumni', authenticateToken, alumniCtrl.getAlumni);
router.post('/alumni/book-mentorship', authenticateToken, alumniCtrl.bookMentorship);

// 16. Grievances
router.get('/grievances', authenticateToken, grievCtrl.getGrievances);
router.post('/grievances/file', authenticateToken, grievCtrl.fileGrievance);
router.put('/grievances/:id/resolve', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN']), grievCtrl.resolveGrievance);

// 17. Finance & Placement Cell Budget
router.get('/finance/budget', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'MANAGEMENT']), finCtrl.getBudgetDetails);
router.post('/finance/expense', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN']), finCtrl.recordExpense);

// 18. Reporting & Accreditation (NIRF/NAAC)
router.get('/reports/nirf', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'MANAGEMENT']), reportCtrl.generateNirfReport);
router.get('/reports/export-csv', authenticateToken, authorize(['TPO_OFFICER', 'ADMIN', 'MANAGEMENT']), reportCtrl.exportPlacementDataCsv);

// 19. Administration & Multi-DB Registry
router.get('/admin/users', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), adminCtrl.getAllUsers);
router.put('/admin/users/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), adminCtrl.updateUserStatus);
router.get('/admin/department-databases', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'TPO_OFFICER', 'MANAGEMENT']), adminCtrl.getDepartmentDatabases);
router.put('/admin/department-databases/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), adminCtrl.updateDepartmentDatabase);
router.get('/admin/audit-logs', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), adminCtrl.getAuditLogs);

// 19b. Department & Academic Management & Bulk Data Import
// Department Management
router.get('/admin/departments', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'TPO_OFFICER', 'MANAGEMENT']), deptAdminCtrl.getDepartments);
router.get('/admin/departments/:deptCode', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.getDepartmentByCode);
router.post('/admin/departments', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.createDepartment);
router.put('/admin/departments/:deptCode', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.updateDepartment);
router.post('/admin/departments/:deptCode/provision', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.provisionDepartmentDb);
router.get('/admin/departments/:deptCode/verify', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.verifyDepartmentDb);

// Academic Structure Management
router.get('/admin/academics', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'TPO_OFFICER', 'MANAGEMENT', 'FACULTY_COORDINATOR']), deptAdminCtrl.getAcademicStructures);
router.post('/admin/academics', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.createAcademicStructure);
router.put('/admin/academics/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.updateAcademicStructure);
router.delete('/admin/academics/:id', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.deleteAcademicStructure);

// Bulk Data Import
router.get('/admin/imports/template', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.downloadTemplate);
router.post('/admin/imports/preview', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), handleImportUpload, deptAdminCtrl.previewAndValidateImport);
router.post('/admin/imports/confirm', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.confirmImport);
router.get('/admin/imports/history', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.getImportHistory);
router.get('/admin/imports/error-report/:jobId', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.downloadErrorReport);

// Dedicated Tenant Database Status Dashboard
router.get('/admin/database-status', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGEMENT']), deptAdminCtrl.getDatabaseStatus);

// Multi-step Wizard Persistent Drafts
router.get('/admin/wizard-drafts/:wizardType', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.getWizardDraft);
router.put('/admin/wizard-drafts/:wizardType', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.saveWizardDraft);
router.delete('/admin/wizard-drafts/:wizardType', authenticateToken, authorize(['ADMIN', 'SUPER_ADMIN']), deptAdminCtrl.clearWizardDraft);

// 20. AI Assistance (Powered by Mistral 7B Instruct GGUF & Live Database RAG)
router.get('/ai/status', authenticateToken, aiCtrl.getAiStatus);
router.post('/ai/ask', authenticateToken, aiCtrl.askDbAssistant);
router.post('/ai/parse-resume', authenticateToken, aiCtrl.parseResume);
router.post('/ai/match-job', authenticateToken, aiCtrl.matchJob);
router.post('/ai/interview-feedback', authenticateToken, aiCtrl.evaluateInterviewAnswer);
router.post('/ai/interview-questions', optionalAuthenticateToken, aiCtrl.generateInterviewQuestions);

// 21. Skill Analyzer & Career Role Recommendations
router.use('/skill-analyzer', requireModule('SKILL_ANALYZER'));
router.get('/skills', skillAnalyzerCtrl.getSkills);
router.get('/skills/categories', skillAnalyzerCtrl.getCategories);
router.get('/student/skills', authenticateToken, skillAnalyzerCtrl.getStudentSkills);
router.put('/student/skills', authenticateToken, skillAnalyzerCtrl.saveStudentSkills);
router.post('/skill-analyzer/analyze', authenticateToken, skillAnalyzerCtrl.analyzeSkills);
router.get('/skill-analyzer/history', authenticateToken, skillAnalyzerCtrl.getAnalysisHistory);
router.get('/skill-analyzer/roadmap/:roleId', authenticateToken, skillAnalyzerCtrl.getRoadmap);
router.patch('/skill-analyzer/roadmap/progress', authenticateToken, skillAnalyzerCtrl.updateRoadmapProgress);
router.get('/skill-analyzer/assessment/quiz/:topic', authenticateToken, skillAnalyzerCtrl.getAssessmentQuiz);
router.post('/skill-analyzer/assessment/submit', authenticateToken, skillAnalyzerCtrl.submitAssessment);

// 21b. Admin Skill Catalogue & Role Requirements Governance
router.get('/admin/skill-catalogue', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), skillAnalyzerCtrl.getAdminCatalogue);
router.put('/admin/skill-catalogue/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), skillAnalyzerCtrl.updateAdminSkill);
router.post('/admin/skill-catalogue', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), skillAnalyzerCtrl.createAdminSkill);
router.put('/admin/role-requirements', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), skillAnalyzerCtrl.updateRoleRequirement);
router.post('/admin/verify-skill', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER', 'FACULTY_COORDINATOR']), skillAnalyzerCtrl.verifyStudentSkill);

// 21c. Career Explorer & Role Domain Catalog (Powered by MySQL career_roles & career_domains)
router.use('/career', requireModule('CAREER_EXPLORER'));
router.get('/career/domains', careerExplorerCtrl.getDomains);
router.get('/career/domains/:slug', careerExplorerCtrl.getDomainBySlug);
router.get('/career/domains/:domainSlug/roles/:roleSlug', careerExplorerCtrl.getRoleByDomainAndRole);
router.get('/career/stats', careerExplorerCtrl.getCareerStats);
router.get('/career/roles', careerExplorerCtrl.getRoles);
router.get('/career/roles/:id', careerExplorerCtrl.getRoleById);
router.get('/career/roles/:id/skills', careerExplorerCtrl.getRoleSkills);
router.get('/career/roles/:id/roadmap', careerExplorerCtrl.getRoleRoadmap);
router.get('/career/roles/:id/projects', careerExplorerCtrl.getRoleProjects);
router.get('/career/roles/:id/fit', optionalAuthenticateToken, careerExplorerCtrl.getRoleFit);
router.post('/career/roles/:id/favorite', optionalAuthenticateToken, careerExplorerCtrl.toggleFavoriteRole);
router.get('/career/favorites', optionalAuthenticateToken, careerExplorerCtrl.getFavoriteRoles);
router.get('/career/compare', careerExplorerCtrl.compareRoles);
router.get('/career/tags', careerExplorerCtrl.getRoleTags);
router.post('/career/assessments', optionalAuthenticateToken, careerExplorerCtrl.submitAssessment);
router.get('/career/assessments', optionalAuthenticateToken, careerExplorerCtrl.getAssessments);

// Admin Catalogue Management
router.post('/career/admin/domains', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), careerExplorerCtrl.adminSaveDomain);
router.put('/career/admin/domains/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), careerExplorerCtrl.adminSaveDomain);
router.post('/career/admin/roles', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), careerExplorerCtrl.adminSaveRole);
router.put('/career/admin/roles/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), careerExplorerCtrl.adminSaveRole);
router.delete('/career/admin/roles/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), careerExplorerCtrl.adminDeleteRole);

// 21d. IT Companies by Location (Career Explorer Location Intelligence)
router.get('/career/companies/location', companyLocationCtrl.searchLocationCompanies);
router.get('/career/companies/locations/meta', companyLocationCtrl.getLocationMetadata);
router.get('/career/companies/:id', companyLocationCtrl.getCompanyDetails);
router.post('/career/companies/admin/:company_id/offices', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), companyLocationCtrl.adminAddOffice);
router.put('/career/companies/admin/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), companyLocationCtrl.adminUpdateCompany);
router.patch('/career/companies/admin/:target/:id/status', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER']), companyLocationCtrl.adminToggleStatus);

// 21e. GitHub Repository Scanner & Portfolio Code Quality Engine
router.post('/github/scan-repo', optionalAuthenticateToken, githubScanCtrl.scanRepo);
router.post('/github/scan', optionalAuthenticateToken, githubScanCtrl.scanRepo);
router.get('/github/scan-stream', optionalAuthenticateToken, githubScanCtrl.scanRepoLiveStream);
router.get('/github/user-repos/:username', optionalAuthenticateToken, githubScanCtrl.getUserRepositories);
router.post('/github/verify-and-import-skills', authenticateToken, githubScanCtrl.verifyAndImportSkills);
router.post('/github/ai-analyze', optionalAuthenticateToken, githubScanCtrl.aiAnalyzeRepo);

// 22. Role-Based LMS (Learning Management System)
router.use('/lms', requireModule('LMS'));
// Dashboard & Metrics
router.get('/lms/dashboard', authenticateToken, lmsCtrl.getDashboard);

// Courses & Enrollment
router.get('/lms/courses', authenticateToken, lmsCtrl.getCourses);
router.get('/lms/courses/:id', authenticateToken, lmsCtrl.getCourseById);
router.post('/lms/courses', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createCourse);
router.put('/lms/courses/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.updateCourse);
router.get('/lms/courses/:id/students', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.getCourseStudents);
router.post('/lms/courses/:id/enroll', authenticateToken, lmsCtrl.enrollCourse);

// Modules & Lessons
router.post('/lms/courses/:courseId/modules', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createModule);
router.post('/lms/modules/:moduleId/lessons', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createLesson);
router.post('/lms/lessons/:id/complete', authenticateToken, lmsCtrl.completeLesson);

// Materials & Resources
router.get('/lms/resources', authenticateToken, lmsCtrl.getResources);
router.post('/lms/resources', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), handleMaterialUpload, lmsCtrl.uploadResource);
router.delete('/lms/resources/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.deleteResource);

// Quizzes & Assessments
router.get('/lms/quizzes', authenticateToken, lmsCtrl.getQuizzes);
router.get('/lms/quizzes/:id', authenticateToken, lmsCtrl.getQuizById);
router.post('/lms/quizzes', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createQuiz);
router.put('/lms/quizzes/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.updateQuiz);
router.delete('/lms/quizzes/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.deleteQuiz);
router.get('/lms/quizzes/:id/attempts', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.getQuizAttempts);
router.post('/lms/quizzes/:id/submit', authenticateToken, lmsCtrl.submitQuizAttempt);

// Assignments & Projects
router.get('/lms/assignments', authenticateToken, lmsCtrl.getAssignments);
router.post('/lms/assignments', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createAssignment);
router.put('/lms/assignments/:id', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.updateAssignment);
router.post('/lms/assignments/:id/submit', authenticateToken, handleAssignmentUpload, lmsCtrl.submitAssignment);

// Grading Queue & Evaluation
router.get('/lms/grading/queue', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'TPO_OFFICER']), lmsCtrl.getGradingQueue);
router.post('/lms/submissions/:id/grade', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'TPO_OFFICER']), lmsCtrl.gradeAssignment);
router.post('/lms/submissions/:id/release', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'TPO_OFFICER']), lmsCtrl.releaseAssignmentResult);

// Student Progress Matrix
router.get('/lms/progress', authenticateToken, lmsCtrl.getStudentProgress);

// Learning Paths
router.get('/lms/learning-paths', authenticateToken, lmsCtrl.getLearningPaths);
router.post('/lms/learning-paths', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createLearningPath);
router.post('/lms/learning-paths/:id/assign', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.assignLearningPath);

// Live Classes & Attendance
router.get('/lms/live-classes', authenticateToken, lmsCtrl.getLiveClasses);
router.post('/lms/live-classes', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.scheduleLiveClass);
router.get('/lms/live-classes/:id/attendance', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.getLiveClassAttendance);
router.post('/lms/live-classes/:id/attendance', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.recordLiveClassAttendance);

// Discussions & Doubts
router.get('/lms/discussions', authenticateToken, lmsCtrl.getDiscussions);
router.post('/lms/discussions', authenticateToken, lmsCtrl.createDiscussion);
router.post('/lms/discussions/:id/reply', authenticateToken, lmsCtrl.replyDiscussion);
router.put('/lms/discussions/:id/resolve', authenticateToken, lmsCtrl.resolveDiscussion);

// Notes & Bookmarks
router.get('/lms/notes', authenticateToken, lmsCtrl.getNotes);
router.post('/lms/notes', authenticateToken, lmsCtrl.saveNote);
router.delete('/lms/notes/:id', authenticateToken, lmsCtrl.deleteNote);

// Certificates & Reports
router.get('/lms/certificates', authenticateToken, lmsCtrl.getCertificates);
router.post('/lms/certificates/issue', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.issueCertificate);
router.get('/lms/reports', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'MANAGEMENT', 'TPO_OFFICER']), lmsCtrl.getReports);

// Notifications, Portfolio & Support
router.get('/lms/notifications', authenticateToken, lmsCtrl.getNotifications);
router.get('/lms/portfolio', authenticateToken, lmsCtrl.getPortfolio);
router.get('/lms/support', authenticateToken, lmsCtrl.getSupportTickets);
router.post('/lms/support', authenticateToken, lmsCtrl.createSupportTicket);
router.get('/lms/announcements', authenticateToken, lmsCtrl.getAnnouncements);
router.post('/lms/announcements', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.createAnnouncement);

// Class Advisor Specific Routes
router.get('/lms/advisor/class-overview', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.getClassAdvisorOverview);
router.post('/lms/advisor/announcement', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.postAdvisorAnnouncement);

// Admin Academic & Faculty Permission Management Routes
router.get('/lms/admin/academic-mappings', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR']), lmsCtrl.getAcademicMappings);
router.post('/lms/admin/assign-faculty', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), lmsCtrl.assignFacultyToCourse);
router.post('/lms/admin/remove-faculty', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), lmsCtrl.removeFacultyFromCourse);
router.post('/lms/admin/update-class-advisor', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), lmsCtrl.updateClassAdvisor);
router.post('/lms/admin/courses', authenticateToken, authorize(['SUPER_ADMIN', 'ADMIN']), lmsCtrl.createAdminCourse);

// Resume Analyzer (Local Mistral 7B Inference)
router.use('/resume-analyzer', resumeAnalyzerRoutes);

module.exports = router;
