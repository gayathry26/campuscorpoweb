const express = require('express');
const router = express.Router();
const resumeAnalyzerCtrl = require('../controllers/resumeAnalyzer.controller');
const { authenticateToken } = require('../middleware/auth');
const { handleResumeUpload } = require('../middleware/resumeUpload.middleware');

// Public/Semi-public health check & role catalogue
router.get('/health', resumeAnalyzerCtrl.getHealth);
router.get('/roles', resumeAnalyzerCtrl.getAvailableRoles);

// Authenticated student endpoints
router.post('/analyze', authenticateToken, handleResumeUpload, resumeAnalyzerCtrl.analyzeResume);
router.get('/history', authenticateToken, resumeAnalyzerCtrl.getAnalysisHistory);
router.get('/history/:id', authenticateToken, resumeAnalyzerCtrl.getAnalysisById);
router.delete('/history/:id', authenticateToken, resumeAnalyzerCtrl.deleteAnalysis);

module.exports = router;
