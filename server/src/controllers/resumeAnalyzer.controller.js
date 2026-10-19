const resumeAnalyzerService = require('../services/resumeAnalyzer.service');

class ResumeAnalyzerController {
  /**
   * Health endpoint: checks API and AI inference runtime status
   * GET /api/v1/resume-analyzer/health
   */
  async getHealth(req, res) {
    try {
      const health = await resumeAnalyzerService.getHealth();
      return res.json({
        success: true,
        ...health,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve AI service health status.',
        error: err.message,
      });
    }
  }

  /**
   * Returns list of searchable career roles and placement jobs
   * GET /api/v1/resume-analyzer/roles
   */
  async getAvailableRoles(req, res) {
    try {
      const data = await resumeAnalyzerService.getAvailableRoles();
      return res.json({
        success: true,
        ...data,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch available career roles.',
        error: err.message,
      });
    }
  }

  /**
   * Uploads and evaluates a resume for a selected job role
   * POST /api/v1/resume-analyzer/analyze
   */
  async analyzeResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No resume document provided. Please upload a PDF or DOCX file.',
        });
      }

      const { roleId, jobId, customJobDescription } = req.body;
      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: 'Target job role is required. Please choose a role from the dropdown.',
        });
      }

      const result = await resumeAnalyzerService.analyzeResume({
        user: req.user,
        file: req.file,
        roleId,
        jobId: jobId ? parseInt(jobId, 10) : null,
        customJobDescription,
      });

      return res.status(200).json({
        success: true,
        message: 'Resume analysis generated successfully using local Mistral 7B AI model.',
        data: result,
      });
    } catch (err) {
      const statusCode = err.isScanned ? 422 : 500;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'An error occurred during resume evaluation.',
        isScanned: err.isScanned || false,
      });
    }
  }

  /**
   * Retrieves past analysis history for authenticated student
   * GET /api/v1/resume-analyzer/history
   */
  async getAnalysisHistory(req, res) {
    try {
      const history = await resumeAnalyzerService.getStudentHistory(req.user.id);
      return res.json({
        success: true,
        count: history.length,
        history,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch resume analysis history.',
        error: err.message,
      });
    }
  }

  /**
   * Retrieves single analysis by ID with ownership enforcement
   * GET /api/v1/resume-analyzer/history/:id
   */
  async getAnalysisById(req, res) {
    try {
      const { id } = req.params;
      const record = await resumeAnalyzerService.getAnalysisById(req.user.id, id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Analysis record not found or you do not have permission to view it.',
        });
      }

      return res.json({
        success: true,
        data: record,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch analysis record.',
        error: err.message,
      });
    }
  }

  /**
   * Deletes an analysis record belonging to the student
   * DELETE /api/v1/resume-analyzer/history/:id
   */
  async deleteAnalysis(req, res) {
    try {
      const { id } = req.params;
      const deleted = await resumeAnalyzerService.deleteAnalysis(req.user.id, id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Analysis record not found or already deleted.',
        });
      }

      return res.json({
        success: true,
        message: 'Analysis record deleted successfully.',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete analysis record.',
        error: err.message,
      });
    }
  }
}

module.exports = new ResumeAnalyzerController();
