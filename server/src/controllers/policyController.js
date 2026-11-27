const path = require('path');
const fs = require('fs');
const { queryCommon, queryDept } = require('../config/db');
const { logAuditEvent } = require('../services/auditService');

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

/**
 * Format a database row into a structured policy document object
 */
function formatPolicy(row) {
  const isInstitutionWideDept = !row.department_code || row.department_code === 'ALL';
  const isInstitutionWideYear = !row.academic_year || row.academic_year === 'ALL';
  const isInstitutionWide = isInstitutionWideDept && isInstitutionWideYear;
  const status = row.status || (row.is_active ? 'PUBLISHED' : 'ARCHIVED');

  return {
    id: row.id,
    title: row.title || row.policy_name || 'Placement Policy Document',
    policyName: row.policy_name || row.title,
    description: row.description || '',
    fileUrl: row.file_url || null,
    fileName: row.file_name || 'policy_document.pdf',
    fileSize: row.file_size ? Number(row.file_size) : null,
    mimeType: row.mime_type || 'application/pdf',
    academicYear: row.academic_year || 'ALL',
    departmentId: row.department_id || null,
    departmentCode: row.department_code || null,
    departmentName: row.dept_name || (row.department_code && row.department_code !== 'ALL' ? `${row.department_code} Department` : 'Institution-Wide (All Departments)'),
    isInstitutionWide,
    isInstitutionWideDept,
    isInstitutionWideYear,
    effectiveDate: row.effective_date ? String(row.effective_date).slice(0, 10) : null,
    status,
    isActive: Boolean(row.is_active),
    uploadedBy: row.uploaded_by || row.approved_by || null,
    uploaderName: row.uploader_name || 'Placement Administration',
    uploaderRole: row.uploader_role || 'ADMIN',
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    // Legacy rule attributes for backward compatibility
    max_offers_allowed: row.max_offers_allowed,
    dream_offer_threshold_lpa: row.dream_offer_threshold_lpa,
    attendance_mandate_percent: row.attendance_mandate_percent,
    rules_config: row.rules_config,
    // snake_case aliases
    file_url: row.file_url,
    file_name: row.file_name,
    file_size: row.file_size,
    academic_year: row.academic_year || 'ALL',
    department_code: row.department_code,
    effective_date: row.effective_date ? String(row.effective_date).slice(0, 10) : null,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  };
}

/**
 * Helper to check if a user can manage a specific policy
 */
function canManagePolicy(user, policy) {
  if (!user) return false;
  if (['SUPER_ADMIN', 'ADMIN', 'TPO_OFFICER', 'MANAGEMENT'].includes(user.role_name)) {
    return true;
  }
  if (user.role_name === 'FACULTY_COORDINATOR') {
    // Coordinators can manage policies for their department or policies they uploaded
    if (policy.uploaded_by === user.id) return true;
    if (policy.department_code && policy.department_code === user.department_code) return true;
    // Coordinators can manage department policies matching their department
    if (!policy.department_code) return false; // Institution-wide reserved for TPO/Admin
  }
  return false;
}

/**
 * GET /api/v1/policies
 * List policies with strict role-based access control
 */
async function getPolicies(req, res, next) {
  try {
    const user = req.user;
    const { status, departmentCode, academicYear, search } = req.query;

    let sql = `
      SELECT p.*,
             dd.dept_name,
             CONCAT(u.first_name, ' ', u.last_name) AS uploader_name,
             u.role_name AS uploader_role
      FROM placement_policies p
      LEFT JOIN department_databases dd ON (p.department_id = dd.id OR p.department_code = dd.dept_code)
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Role-specific visibility rules
    if (user.role_name === 'STUDENT') {
      // Students see ONLY PUBLISHED policies applicable to their department and academic year
      sql += ` AND (p.status = 'PUBLISHED' OR (p.status IS NULL AND p.is_active = 1))`;
      
      // Department filtering:
      // If policy's department_code is NULL or 'ALL', it is visible to all departments.
      // If a specific department is specified, ONLY students of that department can see it.
      const studentDept = user.department_code || 'CSE';
      sql += ` AND (p.department_code IS NULL OR p.department_code = 'ALL' OR p.department_code = ?)`;
      params.push(studentDept);

      // Academic Year filtering:
      // If policy's academic_year is NULL, empty, or 'ALL', it is visible across all student years.
      // If a specific academic year is specified (e.g. '2026-2027'), ONLY students belonging to that year can see it.
      const studentYear = user.academic_year || '2026-2027';
      sql += ` AND (p.academic_year IS NULL OR p.academic_year = '' OR p.academic_year = 'ALL' OR p.academic_year = ?)`;
      params.push(studentYear);

      // Optionally filter by query param if explicitly provided
      if (academicYear && academicYear !== 'ALL') {
        sql += ` AND p.academic_year = ?`;
        params.push(academicYear);
      }
    } else if (user.role_name === 'FACULTY_COORDINATOR') {
      // Coordinators see institution-wide policies + their department's policies
      const coordinatorDept = user.department_code || 'CSE';
      
      if (departmentCode && departmentCode !== 'ALL') {
        sql += ` AND (p.department_code = ?)`;
        params.push(departmentCode);
      } else if (!departmentCode) {
        // By default show coordinator's department + institution-wide
        sql += ` AND (p.department_code IS NULL OR p.department_code = 'ALL' OR p.department_code = ?)`;
        params.push(coordinatorDept);
      }

      if (status && status !== 'ALL') {
        sql += ` AND p.status = ?`;
        params.push(status);
      }
      if (academicYear && academicYear !== 'ALL') {
        sql += ` AND (p.academic_year = ? OR p.academic_year = 'ALL' OR p.academic_year IS NULL)`;
        params.push(academicYear);
      }
    } else {
      // TPO_OFFICER, ADMIN, SUPER_ADMIN, MANAGEMENT see all policies
      if (departmentCode && departmentCode !== 'ALL') {
        sql += ` AND p.department_code = ?`;
        params.push(departmentCode);
      } else if (departmentCode === 'INSTITUTION_WIDE') {
        sql += ` AND (p.department_code IS NULL OR p.department_code = 'ALL')`;
      }

      if (status && status !== 'ALL') {
        sql += ` AND p.status = ?`;
        params.push(status);
      }
      if (academicYear && academicYear !== 'ALL') {
        sql += ` AND p.academic_year = ?`;
        params.push(academicYear);
      }
    }

    if (search) {
      sql += ` AND (p.title LIKE ? OR p.policy_name LIKE ? OR p.description LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY p.effective_date DESC, p.created_at DESC`;

    const rows = await queryCommon(sql, params);
    const data = rows.map(formatPolicy);

    res.json({
      success: true,
      data,
      count: data.length,
      userRole: user.role_name,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/policies/:id
 * Retrieve policy details by ID
 */
async function getPolicyById(req, res, next) {
  try {
    const user = req.user;
    const policyId = req.params.id;

    const rows = await queryCommon(
      `SELECT p.*,
              dd.dept_name,
              CONCAT(u.first_name, ' ', u.last_name) AS uploader_name,
              u.role_name AS uploader_role
       FROM placement_policies p
       LEFT JOIN department_databases dd ON (p.department_id = dd.id OR p.department_code = dd.dept_code)
       LEFT JOIN users u ON p.uploaded_by = u.id
       WHERE p.id = ?`,
      [policyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy document not found.' });
    }

    const policy = rows[0];

    // Enforce student access rule
    if (user.role_name === 'STUDENT') {
      const isPublished = policy.status === 'PUBLISHED' || (!policy.status && policy.is_active === 1);
      const isApplicableDept = !policy.department_code || policy.department_code === 'ALL' || policy.department_code === user.department_code;
      const isApplicableYear = !policy.academic_year || policy.academic_year === 'ALL' || policy.academic_year === (user.academic_year || '2026-2027');

      if (!isPublished || !isApplicableDept || !isApplicableYear) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to view this policy document.',
        });
      }
    }

    res.json({ success: true, data: formatPolicy(policy) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/policies
 * Upload and create a new placement policy document
 */
async function createPolicy(req, res, next) {
  try {
    const user = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'A valid PDF policy document file is required.',
      });
    }

    const {
      title,
      description,
      academicYear,
      academic_year,
      departmentCode,
      department_code,
      effectiveDate,
      effective_date,
      status,
    } = req.body;

    const policyTitle = (title || req.body.policy_name || '').trim();
    if (!policyTitle) {
      // Clean up uploaded file if validation fails
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Policy document title is required.',
      });
    }

    let acYear = (academicYear || academic_year || 'ALL').trim();
    if (acYear === 'INSTITUTION_WIDE' || !acYear) {
      acYear = 'ALL';
    }
    let rawDeptCode = (departmentCode || department_code || '').trim().toUpperCase();
    if (rawDeptCode === 'ALL' || rawDeptCode === 'INSTITUTION_WIDE' || !rawDeptCode) {
      rawDeptCode = null;
    }

    // Role restriction: Faculty coordinators can only upload policies for their department or institution-wide if approved
    if (user.role_name === 'FACULTY_COORDINATOR') {
      if (!rawDeptCode) {
        // Default to coordinator's department if not set
        rawDeptCode = user.department_code || 'CSE';
      } else if (rawDeptCode !== user.department_code && user.department_code) {
        if (file.path && fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (e) {}
        }
        return res.status(403).json({
          success: false,
          message: `Department Coordinator cannot upload policies for other departments (${rawDeptCode}).`,
        });
      }
    }

    // Resolve department_id
    let deptId = null;
    if (rawDeptCode) {
      const deptRows = await queryCommon('SELECT id FROM department_databases WHERE dept_code = ?', [rawDeptCode]);
      if (deptRows.length > 0) {
        deptId = deptRows[0].id;
      }
    }

    const effDate = (effectiveDate || effective_date || new Date().toISOString().slice(0, 10)).trim();
    const policyStatus = VALID_STATUSES.includes(status) ? status : 'PUBLISHED';
    const isActive = policyStatus === 'PUBLISHED' ? 1 : 0;

    const fileUrl = `/uploads/policies/${file.filename}`;
    const fileName = file.originalname || file.filename;
    const fileSize = file.size;

    const result = await queryCommon(
      `INSERT INTO placement_policies 
         (title, policy_name, description, file_url, file_name, file_size, mime_type, academic_year, department_id, department_code, effective_date, status, is_active, uploaded_by, approved_by)
       VALUES (?, ?, ?, ?, ?, ?, 'application/pdf', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        policyTitle,
        policyTitle,
        description || null,
        fileUrl,
        fileName,
        fileSize,
        acYear,
        deptId,
        rawDeptCode,
        effDate,
        policyStatus,
        isActive,
        user.id,
        user.id,
      ]
    );

    const newId = result.insertId;

    await logAuditEvent({
      userId: user.id,
      action: 'UPLOAD_POLICY_DOCUMENT',
      module: 'POLICY_ENGINE',
      details: {
        policyId: newId,
        title: policyTitle,
        departmentCode: rawDeptCode,
        academicYear: acYear,
        status: policyStatus,
        fileName,
        fileSize,
      },
      departmentCode: rawDeptCode,
    });

    const rows = await queryCommon(
      `SELECT p.*,
              dd.dept_name,
              CONCAT(u.first_name, ' ', u.last_name) AS uploader_name,
              u.role_name AS uploader_role
       FROM placement_policies p
       LEFT JOIN department_databases dd ON (p.department_id = dd.id OR p.department_code = dd.dept_code)
       LEFT JOIN users u ON p.uploaded_by = u.id
       WHERE p.id = ?`,
      [newId]
    );

    res.status(201).json({
      success: true,
      message: 'Placement policy document uploaded and saved successfully.',
      data: formatPolicy(rows[0]),
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(err);
  }
}

/**
 * PUT /api/v1/policies/:id
 * Update policy metadata
 */
async function updatePolicy(req, res, next) {
  try {
    const user = req.user;
    const policyId = req.params.id;

    const existingRows = await queryCommon('SELECT * FROM placement_policies WHERE id = ?', [policyId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }
    const current = existingRows[0];

    if (!canManagePolicy(user, current)) {
      return res.status(403).json({ success: false, message: 'Access denied. You cannot modify this policy.' });
    }

    const {
      title,
      description,
      academicYear,
      academic_year,
      departmentCode,
      department_code,
      effectiveDate,
      effective_date,
      status,
      // Legacy rule parameters if sent
      max_offers_allowed,
      dream_offer_threshold_lpa,
      attendance_mandate_percent,
      rules_config,
    } = req.body;

    const newTitle = title !== undefined ? title.trim() : current.title || current.policy_name;
    const newDesc = description !== undefined ? description : current.description;
    let newAcYear = academicYear !== undefined || academic_year !== undefined
      ? (academicYear || academic_year || 'ALL').trim()
      : current.academic_year;
    if (newAcYear === 'INSTITUTION_WIDE' || !newAcYear) {
      newAcYear = 'ALL';
    }

    let newDeptCode = departmentCode !== undefined || department_code !== undefined
      ? (departmentCode || department_code || '').trim().toUpperCase()
      : current.department_code;

    if (newDeptCode === 'ALL' || newDeptCode === 'INSTITUTION_WIDE' || !newDeptCode) {
      newDeptCode = null;
    }

    let newDeptId = current.department_id;
    if (newDeptCode) {
      const deptRows = await queryCommon('SELECT id FROM department_databases WHERE dept_code = ?', [newDeptCode]);
      newDeptId = deptRows.length > 0 ? deptRows[0].id : null;
    } else {
      newDeptId = null;
    }

    const newEffDate = effectiveDate || effective_date || current.effective_date;
    const newStatus = VALID_STATUSES.includes(status) ? status : current.status || 'PUBLISHED';
    const newIsActive = newStatus === 'PUBLISHED' ? 1 : 0;

    await queryCommon(
      `UPDATE placement_policies 
       SET title = ?,
           policy_name = ?,
           description = ?,
           academic_year = ?,
           department_id = ?,
           department_code = ?,
           effective_date = ?,
           status = ?,
           is_active = ?,
           max_offers_allowed = COALESCE(?, max_offers_allowed),
           dream_offer_threshold_lpa = COALESCE(?, dream_offer_threshold_lpa),
           attendance_mandate_percent = COALESCE(?, attendance_mandate_percent),
           rules_config = COALESCE(?, rules_config)
       WHERE id = ?`,
      [
        newTitle,
        newTitle,
        newDesc,
        newAcYear,
        newDeptId,
        newDeptCode,
        newEffDate,
        newStatus,
        newIsActive,
        max_offers_allowed,
        dream_offer_threshold_lpa,
        attendance_mandate_percent,
        rules_config ? JSON.stringify(rules_config) : null,
        policyId,
      ]
    );

    await logAuditEvent({
      userId: user.id,
      action: 'UPDATE_POLICY_DOCUMENT',
      module: 'POLICY_ENGINE',
      details: { policyId, title: newTitle, status: newStatus, departmentCode: newDeptCode },
      departmentCode: newDeptCode,
    });

    const rows = await queryCommon(
      `SELECT p.*,
              dd.dept_name,
              CONCAT(u.first_name, ' ', u.last_name) AS uploader_name,
              u.role_name AS uploader_role
       FROM placement_policies p
       LEFT JOIN department_databases dd ON (p.department_id = dd.id OR p.department_code = dd.dept_code)
       LEFT JOIN users u ON p.uploaded_by = u.id
       WHERE p.id = ?`,
      [policyId]
    );

    res.json({
      success: true,
      message: 'Placement policy updated successfully.',
      data: formatPolicy(rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/policies/:id/replace-file
 * Replace the PDF file of an existing policy
 */
async function replacePolicyFile(req, res, next) {
  try {
    const user = req.user;
    const policyId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'New replacement PDF file is required.' });
    }

    const existingRows = await queryCommon('SELECT * FROM placement_policies WHERE id = ?', [policyId]);
    if (existingRows.length === 0) {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    const current = existingRows[0];
    if (!canManagePolicy(user, current)) {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      return res.status(403).json({ success: false, message: 'Access denied. You cannot modify this policy.' });
    }

    // Attempt to unlink old file if it existed
    if (current.file_url) {
      const oldFilename = path.basename(current.file_url);
      const oldPath = path.join(__dirname, '../../uploads/policies', oldFilename);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    const newFileUrl = `/uploads/policies/${file.filename}`;
    const newFileName = file.originalname || file.filename;
    const newFileSize = file.size;

    await queryCommon(
      `UPDATE placement_policies 
       SET file_url = ?,
           file_name = ?,
           file_size = ?,
           mime_type = 'application/pdf',
           uploaded_by = ?
       WHERE id = ?`,
      [newFileUrl, newFileName, newFileSize, user.id, policyId]
    );

    await logAuditEvent({
      userId: user.id,
      action: 'REPLACE_POLICY_FILE',
      module: 'POLICY_ENGINE',
      details: { policyId, newFileName, newFileSize },
      departmentCode: current.department_code,
    });

    const rows = await queryCommon(
      `SELECT p.*,
              dd.dept_name,
              CONCAT(u.first_name, ' ', u.last_name) AS uploader_name,
              u.role_name AS uploader_role
       FROM placement_policies p
       LEFT JOIN department_databases dd ON (p.department_id = dd.id OR p.department_code = dd.dept_code)
       LEFT JOIN users u ON p.uploaded_by = u.id
       WHERE p.id = ?`,
      [policyId]
    );

    res.json({
      success: true,
      message: 'Policy document PDF replaced successfully.',
      data: formatPolicy(rows[0]),
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(err);
  }
}

/**
 * PATCH /api/v1/policies/:id/status
 * Quick update status: PUBLISHED, ARCHIVED, or DRAFT
 */
async function changePolicyStatus(req, res, next) {
  try {
    const user = req.user;
    const policyId = req.params.id;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const existingRows = await queryCommon('SELECT * FROM placement_policies WHERE id = ?', [policyId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    const current = existingRows[0];
    if (!canManagePolicy(user, current)) {
      return res.status(403).json({ success: false, message: 'Access denied. You cannot modify this policy.' });
    }

    const isActive = status === 'PUBLISHED' ? 1 : 0;

    await queryCommon(
      `UPDATE placement_policies 
       SET status = ?, is_active = ?
       WHERE id = ?`,
      [status, isActive, policyId]
    );

    await logAuditEvent({
      userId: user.id,
      action: 'CHANGE_POLICY_STATUS',
      module: 'POLICY_ENGINE',
      details: { policyId, status },
      departmentCode: current.department_code,
    });

    res.json({
      success: true,
      message: `Policy status transitioned to ${status}.`,
      status,
      isActive: Boolean(isActive),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/policies/:id
 * Remove a policy document and unlinks its file
 */
async function deletePolicy(req, res, next) {
  try {
    const user = req.user;
    const policyId = req.params.id;

    const existingRows = await queryCommon('SELECT * FROM placement_policies WHERE id = ?', [policyId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    const current = existingRows[0];
    if (!canManagePolicy(user, current)) {
      return res.status(403).json({ success: false, message: 'Access denied. You cannot delete this policy.' });
    }

    // Delete file from disk if it exists
    if (current.file_url) {
      const filename = path.basename(current.file_url);
      const filePath = path.join(__dirname, '../../uploads/policies', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    await queryCommon('DELETE FROM placement_policies WHERE id = ?', [policyId]);

    await logAuditEvent({
      userId: user.id,
      action: 'DELETE_POLICY_DOCUMENT',
      module: 'POLICY_ENGINE',
      details: { policyId, title: current.title || current.policy_name },
      departmentCode: current.department_code,
    });

    res.json({ success: true, message: 'Placement policy document permanently deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Internal helper to resolve file path and enforce download/preview authorization
 */
async function resolvePolicyFileAccess(req, res) {
  const user = req.user;
  const policyId = req.params.id;

  const rows = await queryCommon('SELECT * FROM placement_policies WHERE id = ?', [policyId]);
  if (rows.length === 0) {
    res.status(404).json({ success: false, message: 'Policy not found.' });
    return null;
  }

  const policy = rows[0];

  // Permissions check
  if (user.role_name === 'STUDENT') {
    const isPublished = policy.status === 'PUBLISHED' || (!policy.status && policy.is_active === 1);
    const isApplicableDept = !policy.department_code || policy.department_code === 'ALL' || policy.department_code === user.department_code;
    const isApplicableYear = !policy.academic_year || policy.academic_year === 'ALL' || policy.academic_year === (user.academic_year || '2026-2027');

    if (!isPublished || !isApplicableDept || !isApplicableYear) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Policy document is not published or not applicable to your department/year.',
      });
      return null;
    }
  }

  if (!policy.file_url) {
    res.status(404).json({
      success: false,
      message: 'No physical PDF document file is associated with this policy record.',
    });
    return null;
  }

  const filename = path.basename(policy.file_url);
  const filePath = path.join(__dirname, '../../uploads/policies', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      success: false,
      message: 'Policy document file was not found on server storage.',
    });
    return null;
  }

  return { policy, filePath, filename };
}

/**
 * GET /api/v1/policies/:id/preview
 * Stream PDF inline for in-application browser preview
 */
async function previewPolicyFile(req, res, next) {
  try {
    const access = await resolvePolicyFileAccess(req, res);
    if (!access) return;

    const { policy, filePath } = access;
    const safeName = (policy.file_name || policy.title || 'placement-policy').replace(/[^\w.-]/g, '_');
    const finalName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${finalName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/policies/:id/download
 * Download policy document PDF as an attachment
 */
async function downloadPolicyFile(req, res, next) {
  try {
    const access = await resolvePolicyFileAccess(req, res);
    if (!access) return;

    const { policy, filePath } = access;
    const safeName = (policy.file_name || policy.title || 'placement-policy').replace(/[^\w.-]/g, '_');
    const finalName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

    await logAuditEvent({
      userId: req.user.id,
      action: 'DOWNLOAD_POLICY_DOCUMENT',
      module: 'POLICY_ENGINE',
      details: { policyId: policy.id, title: policy.title, fileName: finalName },
      departmentCode: policy.department_code,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

/**
 * Get department-specific eligibility overrides / exceptions
 */
async function getDeptOverrides(req, res, next) {
  try {
    const deptCode = req.params.departmentCode || req.user.department_code || 'CSE';
    const overrides = await queryDept(
      deptCode,
      `SELECT deo.*, j.title AS job_title, c.name AS company_name
       FROM dept_eligibility_overrides deo
       LEFT JOIN lms.jobs j ON j.id = deo.job_id
       LEFT JOIN lms.companies c ON c.id = j.company_id
       ORDER BY deo.approved_at DESC`
    );

    res.json({ success: true, departmentCode: deptCode, data: overrides });
  } catch (err) {
    next(err);
  }
}

/**
 * Grant coordinator exception / waiver into Department DB
 */
async function grantCoordinatorOverride(req, res, next) {
  try {
    const deptCode = req.user.department_code || 'CSE';
    const { register_number, job_id, override_type, reason } = req.body;

    if (!register_number || !job_id || !override_type || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required override fields (reg_no, job_id, type, reason).' });
    }

    const approverName = `${req.user.first_name} ${req.user.last_name}`;

    await queryDept(
      deptCode,
      `INSERT INTO dept_eligibility_overrides (register_number, job_id, override_type, reason, approved_by)
       VALUES (?, ?, ?, ?, ?)`,
      [register_number, job_id, override_type, reason, approverName]
    );

    await logAuditEvent({
      userId: req.user.id,
      action: 'GRANT_DEPT_OVERRIDE',
      module: 'POLICY_ENGINE',
      details: { registerNumber: register_number, jobId: job_id, type: override_type },
      departmentCode: deptCode,
      registerNumber: register_number,
    });

    res.status(201).json({
      success: true,
      message: `Exception override granted in ${deptCode} department database. Candidate is now marked eligible for this job drive.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  replacePolicyFile,
  changePolicyStatus,
  deletePolicy,
  previewPolicyFile,
  downloadPolicyFile,
  getDeptOverrides,
  grantCoordinatorOverride,
};
