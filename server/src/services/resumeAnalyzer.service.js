const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { queryCommon } = require('../config/db');
const resumeParser = require('./resumeParser.service');

const AI_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

class ResumeAnalyzerService {
  /**
   * Health check for Node server and local Python Mistral AI service
   */
  async getHealth() {
    try {
      const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
      return {
        server: 'online',
        aiService: response.data,
      };
    } catch (err) {
      return {
        server: 'online',
        aiService: {
          status: 'unavailable',
          model_loaded: false,
          error: `Could not reach local AI service at ${AI_SERVICE_URL}: ${err.message}`,
        },
      };
    }
  }

  /**
   * Retrieves all career roles and active placement jobs for role matching
   */
  async getAvailableRoles() {
    const rolesQuery = `
      SELECT id, title, category, technical_skills, tools, short_description 
      FROM career_roles 
      ORDER BY category ASC, sort_order ASC, title ASC
    `;
    const jobsQuery = `
      SELECT j.id, j.title, j.role_type, j.job_description, j.eligibility_criteria, c.name as company_name
      FROM jobs j
      LEFT JOIN companies c ON c.id = j.company_id
      WHERE j.status = 'ACTIVE' OR j.status IS NULL
      LIMIT 20
    `;

    const [roles, jobs] = await Promise.all([
      queryCommon(rolesQuery),
      queryCommon(jobsQuery).catch(() => []),
    ]);

    const parsedRoles = roles.map((r) => {
      let technicalSkills = [];
      let tools = [];
      try {
        technicalSkills = typeof r.technical_skills === 'string' ? JSON.parse(r.technical_skills) : (r.technical_skills || []);
      } catch (e) {
        technicalSkills = [];
      }
      try {
        tools = typeof r.tools === 'string' ? JSON.parse(r.tools) : (r.tools || []);
      } catch (e) {
        tools = [];
      }

      return {
        id: r.id,
        title: r.title,
        category: r.category,
        shortDescription: r.short_description,
        technicalSkills,
        tools,
      };
    });

    return {
      roles: parsedRoles,
      placementJobs: jobs.map((j) => ({
        id: j.id,
        title: `${j.title} (${j.company_name || 'Placement Partner'})`,
        roleType: j.role_type,
        description: j.job_description,
      })),
    };
  }

  /**
   * Main analysis execution orchestrator
   */
  async analyzeResume({ user, file, roleId, jobId, customJobDescription }) {
    if (!user || !user.id) {
      throw new Error('Authentication required: user session invalid.');
    }
    if (!roleId) {
      throw new Error('Please select a target job role for the resume analysis.');
    }

    // 1. Extract text from uploaded document
    const extracted = await resumeParser.extractText(file);

    // 2. Fetch role metadata from database
    const roleRows = await queryCommon(
      'SELECT id, title, technical_skills, tools, short_description FROM career_roles WHERE id = ? LIMIT 1',
      [roleId]
    );

    let roleTitle = roleId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    let targetSkills = [];
    let targetTools = [];

    if (roleRows && roleRows.length > 0) {
      const r = roleRows[0];
      roleTitle = r.title;
      try {
        targetSkills = typeof r.technical_skills === 'string' ? JSON.parse(r.technical_skills) : (r.technical_skills || []);
      } catch (e) {
        targetSkills = [];
      }
      try {
        targetTools = typeof r.tools === 'string' ? JSON.parse(r.tools) : (r.tools || []);
      } catch (e) {
        targetTools = [];
      }
    }

    // 3. Check for specific placement job requirements
    let jobDescription = customJobDescription || '';
    let linkedJobId = null;

    if (jobId) {
      const jobRows = await queryCommon(
        'SELECT id, title, job_description, eligibility_criteria FROM jobs WHERE id = ? LIMIT 1',
        [jobId]
      );
      if (jobRows && jobRows.length > 0) {
        linkedJobId = jobRows[0].id;
        const jobDesc = `${jobRows[0].title}: ${jobRows[0].job_description || ''} ${jobRows[0].eligibility_criteria || ''}`;
        jobDescription = jobDescription ? `${jobDescription}\n${jobDesc}` : jobDesc;
      }
    }

    // 4. Look up student_id if user is linked to students_master
    let studentId = null;
    try {
      const studentRows = await queryCommon(
        'SELECT id FROM students_master WHERE user_id = ? LIMIT 1',
        [user.id]
      );
      if (studentRows && studentRows.length > 0) {
        studentId = studentRows[0].id;
      }
    } catch (e) {
      // Non-critical student_id link
    }

    // 5. Call local Python AI Service for Mistral 7B inference
    const aiPayload = {
      resume_text: extracted.text,
      role_id: roleId,
      role_title: roleTitle,
      target_skills: targetSkills,
      target_tools: targetTools,
      job_description: jobDescription,
    };

    let aiResult;
    try {
      // 180s timeout to allow local CPU inference to generate complete tokens safely
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, aiPayload, {
        timeout: 180000,
        headers: { 'Content-Type': 'application/json' },
      });
      aiResult = aiResponse.data;
    } catch (aiErr) {
      if (aiErr.code === 'ECONNREFUSED') {
        throw new Error('Local Mistral 7B AI service is not running on port 8000. Please ensure the Python service is active.');
      }
      if (aiErr.response && aiErr.response.data && aiErr.response.data.detail) {
        throw new Error(`AI Inference Error: ${aiErr.response.data.detail}`);
      }
      throw new Error(`Failed to communicate with Mistral AI service: ${aiErr.message}`);
    }

    // 6. Validate and persist to MySQL database
    const analysisUuid = uuidv4();
    const overallScore = Math.max(0, Math.min(100, Math.round(aiResult.overallScore || 0)));
    const jobMatchScore = Math.max(0, Math.min(100, Math.round(aiResult.jobMatchScore || 0)));

    const insertQuery = `
      INSERT INTO resume_analyses (
        uuid, user_id, student_id, role_id, role_title, job_id,
        original_filename, file_format, file_size_bytes,
        overall_score, job_match_score, analysis_json, model_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertParams = [
      analysisUuid,
      user.id,
      studentId,
      roleId,
      roleTitle,
      linkedJobId,
      file.originalname,
      extracted.format,
      file.size,
      overallScore,
      jobMatchScore,
      JSON.stringify(aiResult),
      aiResult.model_id || 'mistral-7b-instruct-v0.1.Q4_K_M',
    ];

    const result = await queryCommon(insertQuery, insertParams);

    return {
      id: result.insertId,
      uuid: analysisUuid,
      roleId,
      roleTitle,
      originalFilename: file.originalname,
      fileFormat: extracted.format,
      fileSizeBytes: file.size,
      wordCount: extracted.wordCount,
      pageCount: extracted.pageCount,
      overallScore,
      jobMatchScore,
      analysis: aiResult,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves analysis history for the authenticated student
   */
  async getStudentHistory(userId) {
    const query = `
      SELECT id, uuid, role_id, role_title, job_id, original_filename,
             file_format, file_size_bytes, overall_score, job_match_score,
             analysis_json, model_id, created_at
      FROM resume_analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const rows = await queryCommon(query, [userId]);

    return rows.map((r) => {
      let analysis = null;
      try {
        analysis = typeof r.analysis_json === 'string' ? JSON.parse(r.analysis_json) : r.analysis_json;
      } catch (e) {
        analysis = {};
      }

      return {
        id: r.id,
        uuid: r.uuid,
        roleId: r.role_id,
        roleTitle: r.role_title,
        jobId: r.job_id,
        originalFilename: r.original_filename,
        fileFormat: r.file_format,
        fileSizeBytes: r.file_size_bytes,
        overallScore: r.overall_score,
        jobMatchScore: r.job_match_score,
        analysis,
        modelId: r.model_id,
        createdAt: r.created_at,
      };
    });
  }

  /**
   * Retrieves single analysis by ID or UUID with strict student ownership
   */
  async getAnalysisById(userId, analysisId) {
    const query = `
      SELECT id, uuid, role_id, role_title, job_id, original_filename,
             file_format, file_size_bytes, overall_score, job_match_score,
             analysis_json, model_id, created_at
      FROM resume_analyses
      WHERE (id = ? OR uuid = ?) AND user_id = ?
      LIMIT 1
    `;
    const rows = await queryCommon(query, [analysisId, analysisId, userId]);
    if (!rows || rows.length === 0) {
      return null;
    }

    const r = rows[0];
    let analysis = null;
    try {
      analysis = typeof r.analysis_json === 'string' ? JSON.parse(r.analysis_json) : r.analysis_json;
    } catch (e) {
      analysis = {};
    }

    return {
      id: r.id,
      uuid: r.uuid,
      roleId: r.role_id,
      roleTitle: r.role_title,
      jobId: r.job_id,
      originalFilename: r.original_filename,
      fileFormat: r.file_format,
      fileSizeBytes: r.file_size_bytes,
      overallScore: r.overall_score,
      jobMatchScore: r.job_match_score,
      analysis,
      modelId: r.model_id,
      createdAt: r.created_at,
    };
  }

  /**
   * Deletes an analysis record with strict student ownership
   */
  async deleteAnalysis(userId, analysisId) {
    const query = `
      DELETE FROM resume_analyses
      WHERE (id = ? OR uuid = ?) AND user_id = ?
    `;
    const result = await queryCommon(query, [analysisId, analysisId, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new ResumeAnalyzerService();
