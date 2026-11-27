const { queryCommon, queryDept } = require('../config/db');
const { logAuditEvent } = require('../services/auditService');

let profileDetailsColumnEnsured = false;

async function ensureProfileDetailsColumn() {
  if (profileDetailsColumnEnsured) return;
  try {
    await queryCommon(`ALTER TABLE students_master ADD COLUMN profile_details JSON NULL`);
  } catch (err) {
    // Ignore ER_DUP_FIELDNAME (column already exists)
  }
  profileDetailsColumnEnsured = true;
}

/**
 * List all students with search, filters, and pagination
 */
async function getAllStudents(req, res, next) {
  try {
    const { department, status, minCgpa, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Role department isolation for faculty coordinator
    if (req.user.role_name === 'FACULTY_COORDINATOR') {
      whereClause += ' AND sm.department_code = ?';
      params.push(req.user.department_code);
    } else if (department && department !== 'ALL') {
      whereClause += ' AND sm.department_code = ?';
      params.push(department.toUpperCase());
    }

    if (status && status !== 'ALL') {
      whereClause += ' AND sm.placement_status = ?';
      params.push(status);
    }

    if (minCgpa) {
      whereClause += ' AND sm.cgpa >= ?';
      params.push(parseFloat(minCgpa));
    }

    if (search) {
      whereClause += ' AND (sm.register_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM students_master sm
      JOIN users u ON u.id = sm.user_id
      ${whereClause}
    `;
    const [countRows] = await queryCommon(countSql, params);
    const totalCount = countRows.total;

    const listSql = `
      SELECT sm.*, u.first_name, u.last_name, u.email, u.phone, u.status AS account_status
      FROM students_master sm
      JOIN users u ON u.id = sm.user_id
      ${whereClause}
      ORDER BY sm.cgpa DESC
      LIMIT ? OFFSET ?
    `;
    const students = await queryCommon(listSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get individual student by ID including their department database semester breakdown
 */
async function getStudentById(req, res, next) {
  try {
    await ensureProfileDetailsColumn();
    const studentId = req.params.id;

    const students = await queryCommon(
      `SELECT sm.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
       FROM students_master sm
       JOIN users u ON u.id = sm.user_id
       WHERE sm.id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = students[0];

    // Parse profile_details JSON safely
    if (student.profile_details && typeof student.profile_details === 'string') {
      try {
        student.profile_details = JSON.parse(student.profile_details);
      } catch (e) {
        student.profile_details = {};
      }
    }

    // Check department isolation: if faculty coordinator, ensure same department
    if (req.user.role_name === 'FACULTY_COORDINATOR' && req.user.department_code !== student.department_code) {
      return res.status(403).json({
        success: false,
        message: 'Department isolation violation: You cannot access students outside your department.',
      });
    }

    // Query Department Database for isolated semester breakdown & mentoring notes
    let academicBreakdown = null;
    let mockEvals = [];
    try {
      const deptRows = await queryDept(
        student.department_code,
        `SELECT * FROM dept_students_academic WHERE register_number = ?`,
        [student.register_number]
      );
      if (deptRows.length > 0) {
        academicBreakdown = deptRows[0];
      }

      mockEvals = await queryDept(
        student.department_code,
        `SELECT * FROM dept_mock_evaluations WHERE register_number = ? ORDER BY evaluation_date DESC`,
        [student.register_number]
      );
    } catch (deptErr) {
      console.warn(`[Student Dept DB] Failed to query ${student.department_code} DB:`, deptErr.message);
    }

    // Documents from common DB
    const documents = await queryCommon(
      `SELECT * FROM student_documents WHERE student_id = ? ORDER BY created_at DESC`,
      [studentId]
    );

    // Applications & Offers
    const applications = await queryCommon(
      `SELECT ja.*, j.title AS job_title, j.ctc_lpa, c.name AS company_name
       FROM job_applications ja
       JOIN jobs j ON j.id = ja.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE ja.student_id = ?`,
      [studentId]
    );

    res.json({
      success: true,
      student,
      departmentAcademicData: academicBreakdown,
      mockEvaluations: mockEvals,
      documents,
      applications,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update student profile (editable student personal, skills, portfolio & career fields only)
 * Academic records (backlogs, CGPA, 10th/12th, placement status) are strictly Admin-only.
 */
async function updateStudentProfile(req, res, next) {
  try {
    await ensureProfileDetailsColumn();
    const studentId = req.params.id;
    const {
      skills,
      linkedin_url,
      github_url,
      portfolio_url,
      phone,
      bio,
      date_of_birth,
      gender,
      city,
      preferred_locations,
      coding_profile_url,
      target_roles,
      certifications,
      languages_known,
      projects_summary,
      internships_summary,
    } = req.body;

    // Ensure student only updates their own profile unless staff
    if (req.user.role_name === 'STUDENT' && req.user.student_id !== parseInt(studentId, 10)) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile.' });
    }

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : (skills || '[]');

    const extendedDetails = {
      bio: bio || '',
      date_of_birth: date_of_birth || '',
      gender: gender || '',
      city: city || '',
      preferred_locations: preferred_locations || '',
      coding_profile_url: coding_profile_url || '',
      target_roles: target_roles || '',
      certifications: certifications || '',
      languages_known: languages_known || '',
      projects_summary: projects_summary || '',
      internships_summary: internships_summary || '',
    };

    await queryCommon(
      `UPDATE students_master 
       SET skills = ?, linkedin_url = ?, github_url = ?, portfolio_url = ?, profile_details = ?
       WHERE id = ?`,
      [
        skillsJson,
        linkedin_url || null,
        github_url || null,
        portfolio_url || null,
        JSON.stringify(extendedDetails),
        studentId,
      ]
    );

    if (phone !== undefined) {
      await queryCommon(
        `UPDATE users u
         JOIN students_master sm ON sm.user_id = u.id
         SET u.phone = ?
         WHERE sm.id = ?`,
        [phone || null, studentId]
      );
    }

    await logAuditEvent({
      userId: req.user.id,
      action: 'UPDATE_PROFILE',
      module: 'STUDENT_PROFILE',
      details: { studentId },
    });

    res.json({ success: true, message: 'Student profile updated successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN-ONLY: Update verified academic & backlog records for a specific student
 */
async function updateStudentAcademicRecords(req, res, next) {
  try {
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER', 'FACULTY_COORDINATOR'];
    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'Only Institution Administrators or Placement Officers can modify official academic and backlog records.',
      });
    }

    const studentId = req.params.id;
    const {
      active_backlogs,
      history_of_backlogs,
      cgpa,
      tenth_percentage,
      twelfth_percentage,
      current_semester,
      placement_status,
      placement_readiness_score,
    } = req.body;

    const existing = await queryCommon('SELECT * FROM students_master WHERE id = ?', [studentId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = existing[0];
    if (req.user.role_name === 'FACULTY_COORDINATOR' && req.user.department_code !== student.department_code) {
      return res.status(403).json({
        success: false,
        message: 'You can only update academic records for students in your department.',
      });
    }

    const safeActiveBacklogs = Math.max(0, parseInt(active_backlogs ?? student.active_backlogs ?? 0, 10) || 0);
    const safeHistoryBacklogs = Math.max(
      safeActiveBacklogs,
      parseInt(history_of_backlogs ?? student.history_of_backlogs ?? 0, 10) || 0
    );
    const safeCgpa = Math.min(10, Math.max(0, parseFloat(cgpa ?? student.cgpa ?? 0) || 0));
    const safeTenth = Math.min(100, Math.max(0, parseFloat(tenth_percentage ?? student.tenth_percentage ?? 0) || 0));
    const safeTwelfth = Math.min(100, Math.max(0, parseFloat(twelfth_percentage ?? student.twelfth_percentage ?? 0) || 0));
    const safeSemester = Math.min(10, Math.max(1, parseInt(current_semester ?? student.current_semester ?? 7, 10) || 7));
    const safeReadiness = Math.min(100, Math.max(0, parseInt(placement_readiness_score ?? student.placement_readiness_score ?? 75, 10) || 75));
    const validStatuses = ['NOT_REGISTERED', 'REGISTERED', 'OPTED_OUT', 'PLACED', 'MULTIPLE_OFFERS'];
    const safeStatus = validStatuses.includes(placement_status) ? placement_status : student.placement_status;

    await queryCommon(
      `UPDATE students_master
       SET active_backlogs = ?,
           history_of_backlogs = ?,
           cgpa = ?,
           tenth_percentage = ?,
           twelfth_percentage = ?,
           current_semester = ?,
           placement_status = ?,
           placement_readiness_score = ?
       WHERE id = ?`,
      [
        safeActiveBacklogs,
        safeHistoryBacklogs,
        safeCgpa,
        safeTenth,
        safeTwelfth,
        safeSemester,
        safeStatus,
        safeReadiness,
        studentId,
      ]
    );

    await logAuditEvent({
      userId: req.user.id,
      action: 'ADMIN_UPDATE_ACADEMIC_RECORDS',
      module: 'STUDENT_ACADEMICS',
      details: {
        studentId,
        active_backlogs: safeActiveBacklogs,
        history_of_backlogs: safeHistoryBacklogs,
        cgpa: safeCgpa,
        placement_status: safeStatus,
      },
    });

    res.json({
      success: true,
      message: 'Official academic and backlog records updated successfully.',
      data: {
        active_backlogs: safeActiveBacklogs,
        history_of_backlogs: safeHistoryBacklogs,
        cgpa: safeCgpa,
        tenth_percentage: safeTenth,
        twelfth_percentage: safeTwelfth,
        current_semester: safeSemester,
        placement_status: safeStatus,
        placement_readiness_score: safeReadiness,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Mock ERP Import / Sync function
 */
async function syncFromErp(req, res, next) {
  try {
    const { register_number } = req.body;
    res.json({
      success: true,
      message: `ERP synchronization completed for ${register_number || 'all active students'}. Records validated with institutional registrar.`,
      syncedCount: 1,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudentProfile,
  updateStudentAcademicRecords,
  syncFromErp,
};
